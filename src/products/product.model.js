import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category",
      required: true 
    },
    salesCount: { type: Number, default: 0 }, // Para identificar los más vendidos
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Product", productSchema);
