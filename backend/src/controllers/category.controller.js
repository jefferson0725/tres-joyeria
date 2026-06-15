import { Category } from "../models/category.model.js";
import { autoExport } from "./export.controller.js";

// Create a new category
export const createCategory = async (req, res) => {
	try {
		const { name, description, parentId } = req.body;

		if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

		// Validate 2-level max: if parentId provided, parent must not have its own parent
		if (parentId) {
			const parent = await Category.findByPk(parentId);
			if (!parent) return res.status(400).json({ error: "La categoría padre no existe" });
			if (parent.parentId) return res.status(400).json({ error: "No se puede crear una subcategoría de una subcategoría" });
		}

		const [category, created] = await Category.findOrCreate({
			where: { name },
			defaults: { description, parentId: parentId || null },
		});

		if (!created) return res.status(409).json({ error: "La categoría ya existe" });

		await autoExport();

		res.status(201).json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update category by id
export const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, parentId } = req.body;

		const category = await Category.findByPk(id);
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		// Validate 2-level max
		if (parentId !== undefined) {
			if (parentId !== null) {
				const parent = await Category.findByPk(parentId);
				if (!parent) return res.status(400).json({ error: "La categoría padre no existe" });
				if (parent.parentId) return res.status(400).json({ error: "No se puede anidar más de 2 niveles" });
				// Can't set own parent if this category already has children
				const childCount = await Category.count({ where: { parentId: id } });
				if (childCount > 0) return res.status(400).json({ error: "Esta categoría ya tiene subcategorías y no puede convertirse en subcategoría" });
			}
			category.parentId = parentId;
		}

		if (name && name !== category.name) {
			const existing = await Category.findOne({ where: { name } });
			if (existing) return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
			category.name = name;
		}

		if (description !== undefined) category.description = description;

		await category.save();
		await autoExport();

		res.json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Soft delete category (paranoid)
export const softDeleteCategory = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await Category.findByPk(id);
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		await category.destroy();
		await autoExport();

		res.json({ message: "Categoría eliminada (soft delete)", id });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get all categories — flat list with parentId (used by admin selects)
export const getCategories = async (req, res) => {
	try {
		const categories = await Category.findAll({
			attributes: ["id", "name", "description", "parentId"],
			order: [["parentId", "ASC NULLS FIRST"], ["name", "ASC"]],
		});
		res.json(categories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get category by id
export const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByPk(id, {
			attributes: ["id", "name", "description", "parentId"],
		});
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		res.json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Restore a soft-deleted category
export const restoreCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const category = await Category.findByPk(id, { paranoid: false });
		if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

		await category.restore();
		res.json({ message: "Categoría restaurada", category });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
