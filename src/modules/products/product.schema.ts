import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Product name is required"),
        price: z.number().positive('Price must be postivie'),
        categoryId: z.string().uuid("Invalid category ID"),
        description: z.string().min(1, "Product description is required"),
        brandId: z.string().uuid("Invalid brand ID").optional(),
        images: z.array(z.string().url("Invalid image URL")).optional(),
        attributes: z.array(z.object({
            key: z.string().min(1, "Attribute key is required"),
            value: z.string().min(1, "Attribute value is required")
        })).optional(),
    })

}) 