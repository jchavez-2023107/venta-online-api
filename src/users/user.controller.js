import User from "./user.model.js";
import AuditLog from "./audit.log.model.js";
import { encrypt, checkPassword } from "../../utils/encrypt.js";
import { generateToken } from "../../utils/jwt.js";

/**
 * Registrar un nuevo usuario (CLIENT por defecto)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, surname, username, email, password, phone, preferences } =
      req.body;

    // Verificar si el email o username ya existen
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Username or Email already taken" });

    // Encriptar la contraseña
    const hashedPassword = await encrypt(password);

    // Crear nuevo usuario (con CLIENT_ROLE y asignando preferencias si se enviaron)
    const newUser = new User({
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      phone,
      role: "CLIENT_ROLE",
      preferences: preferences || {}, // Asigna lo enviado o, en su defecto, el objeto vacío
    });

    await newUser.save();

    // Recuperar el usuario sin la contraseña
    const savedUser = await User.findById(newUser._id).select("-password");

    res
      .status(201)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

/**
 * Iniciar sesión (Login)
 */
export const loginUser = async (req, res) => {
  try {
    const { userlogin, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: userlogin }, { email: userlogin }],
    }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await checkPassword(user.password, password);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = await generateToken({
      uid: user._id,
      username: user.username,
      role: user.role,
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

/**
 * Obtener perfil del usuario autenticado (Self)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error in getUserProfile:", error);
    res.status(500).json({ message: "Error retrieving user profile" });
  }
};

/**
 * Actualizar perfil del usuario (Self)
 * Permite actualizar datos personales. Para la contraseña, se usa el endpoint especial).
 * Nota: No se permiten cambios en rol.
 */
export const updateUserProfile = async (req, res) => {
  try {
    // Extraemos los campos a actualizar, incluyendo username y email
    const { name, surname, username, email, phone, preferences } = req.body;

    // Obtenemos el usuario actual desde la base de datos
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // Verificar si el email es diferente y ya existe en otro usuario
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: currentUser._id },
      });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Verificar si el username es diferente y ya existe en otro usuario
    if (username && username !== currentUser.username) {
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: currentUser._id },
      });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Preparar los datos a actualizar
    const updateData = {};
    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = preferences;

    // Actualizar el usuario y devolver la respuesta sin la contraseña
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error in updateUserProfile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

/**
 * Eliminar cuenta de usuario (Soft Delete con confirmación y registro de auditoría)
 * Solo CLIENT_ROLE puede autoeliminarse.
 */
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role === "ADMIN_ROLE") {
      return res
        .status(403)
        .json({ message: "Admins cannot delete their own accounts" });
    }

    // Se requiere la contraseña actual para confirmar la eliminación.
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return res
        .status(400)
        .json({ message: "Current password is required for account deletion" });
    }

    // Buscar al usuario y obtener la contraseña
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verificar que la contraseña actual sea correcta
    const isMatch = await checkPassword(user.password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Realizamos un soft delete: actualizamos el usuario para marcarlo como inactivo
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { active: false, deletedAt: Date.now() },
      { new: true }
    );

    // Obtener la IP de la solicitud (puede venir en headers o en req.ip)
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";

    // Registrar en la auditoría la acción de eliminación
    await AuditLog.create({
      user: req.user.id,
      action: "Account Deletion Request (Soft Delete)",
      ip: ipAddress,
      details: {
        message: "User account disabled instead of permanent deletion.",
      },
    });

    // Mover el usuario: lo eliminamos de la colección users
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      message: "User account disabled successfully",
      archivedUser: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error in deleteUser:", error);
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

/**
 * Obtener todos los usuarios desactivados (soft-deleted)
 */
export const getDisabledUsers = async (req, res) => {
  try {
    // Filtrar por usuarios que hayan sido deshabilitados (active:false y deletedAt establecido)
    const disabledUsers = await User.find({ active: false, deletedAt: { $ne: null } });
    
    if (!disabledUsers || disabledUsers.length === 0) {
      return res.status(404).json({ message: "No disabled users found" });
    }

    res.status(200).json({ message: "Usuarios encontrados:", disabledUsers });
  } catch (error) {
    console.error("❌ Error in getDisabledUsers:", error);
    res.status(500).json({ message: "Error retrieving disabled users", error: error.message });
  }
};


/* ───────── CRUD para usuarios gestionados por ADMIN ───────── */

/**
 * Crear usuario (por Admin)
 */
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      surname,
      username,
      email,
      password,
      phone,
      role,
      preferences,
    } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already taken" });
    }
    const hashedPassword = await encrypt(password);
    const newUser = new User({
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      phone,
      role:
        role && (role === "ADMIN_ROLE" || role === "CLIENT_ROLE")
          ? role
          : "CLIENT_ROLE",
      preferences: preferences || {}, // Asigna lo enviado o, en su defecto, el objeto vacío
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("❌ Error in createUserByAdmin:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

/**
 * Listar todos los usuarios
 */
export const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};

/**
 * Buscar usuario por ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error in getUserById:", error);
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

/**
 * Actualizar usuario por ID (por Admin)
 */
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, phone, role, password, preferences } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;
    if (phone) updateData.phone = phone;
    if (role) {
      if (role !== "ADMIN_ROLE" && role !== "CLIENT_ROLE") {
        return res.status(400).json({ message: "Invalid role" });
      }
      updateData.role = role;
    }
    if (password) {
      updateData.password = await encrypt(password);
    }
    if (preferences) updateData.preferences = preferences;
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Error in updateUserByAdmin:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

/**
 * Eliminar usuario por ID (por Admin)
 */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res
        .status(403)
        .json({ message: "Admins cannot delete their own accounts" });
    }

    // Realizamos un soft delete: actualizamos al usuario para marcarlo como inactivo
    const disabledUser = await User.findByIdAndUpdate(
      id, 
      { active: false, deletedAt: Date.now() },
      { new: true }
    );

    if(!disabledUser)
      return res.status(404).json({ message: "User not found" });

    // Registrar en AuditLog la acción de eliminación
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";
    await AuditLog.create({
      user: req.user.id,
      action: "Account Deletion Request (Soft Delete) - by Admin",
      ip: ipAddress,
      details: {
        message: "User account disabled by admin instead of permanent deletion.",
      },
    });
    
    res.status(200).json({ message: "User disabled successfully", user: disabledUser });

  } catch (error) {
    console.error("❌ Error in deleteUserByAdmin:", error);
    res
      .status(500)
      .json({ message: "Error disabling user", error: error.message });
  }
};

/**
 * Obtener historial de compras del usuario (CLIENT)
 */
export const getUserInvoices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("invoices");
    res.status(200).json({ invoices: user.invoices });
  } catch (error) {
    console.error("❌ Error in getUserInvoices:", error);
    res
      .status(500)
      .json({ message: "Error retrieving invoices", error: error.message });
  }
};

/**
 * Actualizar contraseña (Endpoint especial)
 * - Se requiere enviar el currentPassword y el newPassword.
 * - Se verifica que el currentPassword sea correcto.
 * - Se encripta y actualiza el newPassword.
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await checkPassword(user.password, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await encrypt(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error updating password:", error);
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

/**
 * Agregar usuarios por defecto (con contraseñas encriptadas)
 */
export const agregarUsuariosPorDefecto = async () => {
  try {
    const usuariosExistentes = await User.countDocuments();
    if (usuariosExistentes === 0) {
      const hashedAdminPassword = await encrypt("12345678Aa!");
      const hashedClientPassword = await encrypt("12345678Aa!");
      const usuariosPorDefecto = [
        {
          name: "Marla",
          surname: "Pérez",
          username: "mperez",
          email: "mperez@gmail.com",
          password: hashedAdminPassword,
          phone: "55986458",
          role: "ADMIN_ROLE",
          preferences: {
            newsletter: true,
            theme: "pink",
          },
        },
        {
          name: "Alberto",
          surname: "Pérez",
          username: "aperez",
          email: "aperez@gmail.com",
          password: hashedClientPassword,
          phone: "55986458",
          role: "CLIENT_ROLE",
          preferences: {
            newsletter: true,
            theme: "dark",
          },
        },
      ];
      await User.insertMany(usuariosPorDefecto);
      console.log("✅ Usuarios por defecto agregados");
    } else {
      console.log(
        "ℹ️ Ya existen usuarios en la base de datos, no se crearon usuarios por defecto"
      );
    }
  } catch (error) {
    console.error("Error al agregar usuarios por defecto:", error);
  }
};
