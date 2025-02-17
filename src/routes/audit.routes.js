import { Router } from "express";
import AuditLog from "../models/auditLog.model.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const router = Router();

/**
 * GET /api/audit-logs
 * Este endpoint permite a los administradores ver todos los registros de auditoría.
 * Se requiere token válido y rol ADMIN.
 */
router.get("/", validateJWT, authorizeRoles("ADMIN_ROLE"), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "username email")
      .sort({ date: -1 });
    res.status(200).json({ auditLogs: logs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving audit logs", error: error.message });
  }
});

export default router;
