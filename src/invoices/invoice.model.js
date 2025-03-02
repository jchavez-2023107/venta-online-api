import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // precio del producto al momento de la compra
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [invoiceItemSchema],
    total: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["CREATED", "PAID", "CANCELLED"], 
      default: "CREATED" 
    }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Invoice", invoiceSchema);
