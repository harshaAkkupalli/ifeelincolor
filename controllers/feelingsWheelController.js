// controllers/feelingsWheelController.js
const FeelingNode = require("../models/feelingsWheel");
const FeelingFormMeta = require("../models/FeelingFormMeta");

// ============ PUBLIC API (No Auth) ============

/**
 * GET /api/feelings-wheel
 * Public endpoint - returns complete feelings wheel data
 */
const getFeelingsWheel = async (req, res) => {
  try {
    const meta = await FeelingFormMeta.getSingleton();

    const allNodes = await FeelingNode.find({ isActive: true })
      .lean()
      .sort({ order: 1, label: 1 });

    // ================= GROUPING (PERFORMANCE FIX) =================
    const grouped = {};
    allNodes.forEach((node) => {
      if (!grouped[node.parentKey]) grouped[node.parentKey] = [];
      grouped[node.parentKey].push(node);
    });

    // ================= TREE WITH COLOR INHERITANCE =================
    const buildTree = (
      parentKey = null,
      parentColor = null,
      parentHex = null,
    ) => {
      return (grouped[parentKey] || []).map((node) => {
        const colorGroup = node.colorGroup || parentColor;
        const hexCode =
          node.hexCode && node.hexCode.inner ? node.hexCode : parentHex;

        return {
          key: node.key,
          label: node.label,
          type: node.type,
          colorGroup,
          hexCode,
          order: node.order,
          children: buildTree(node.key, colorGroup, hexCode),
        };
      });
    };

    // ================= FORM QUESTIONS =================
    const buildFormQuestions = () => {
      const questions = [];

      const primaries = allNodes.filter((n) => n.type === "primary");

      // Primary
      questions.push({
        key: "q.primary",
        text: meta.primaryQuestion,
        options: primaries.map((p) => ({
          key: p.key,
          label: p.label,
          colorGroup: p.colorGroup,
          hexCode: p.hexCode,
          nextQuestionKey: p.nextQuestionKey || `q.secondary.${p.key}`,
        })),
      });

      // Secondary
      for (const primary of primaries) {
        const secondaries = grouped[primary.key] || [];
        if (!secondaries.length) continue;

        questions.push({
          key: `q.secondary.${primary.key}`,
          text: meta.secondaryQuestionTemplate.replace(
            "{parent}",
            primary.label,
          ),
          options: secondaries.map((s) => ({
            key: s.key,
            label: s.label,
            nextQuestionKey: s.nextQuestionKey || `q.tertiary.${s.key}`,
          })),
        });
      }

      // Tertiary
      const secondaries = allNodes.filter((n) => n.type === "secondary");

      for (const secondary of secondaries) {
        const tertiaries = grouped[secondary.key] || [];
        if (!tertiaries.length) continue;

        questions.push({
          key: `q.tertiary.${secondary.key}`,
          text: meta.tertiaryQuestionTemplate.replace(
            "{parent}",
            secondary.label,
          ),
          options: tertiaries.map((t) => ({
            key: t.key,
            label: t.label,
            nextQuestionKey: null,
          })),
        });
      }

      return questions;
    };

    // ================= COLOR GROUPS =================
    const colorGroups = {};
    allNodes
      .filter((n) => n.type === "primary")
      .forEach((node) => {
        colorGroups[node.colorGroup] = {
          primary: node.label,
          hexCode: node.hexCode,
        };
      });

    // ================= RESPONSE =================
    return res.status(200).json({
      status: "success",
      body: {
        title: meta.title,
        prompt: meta.prompt,
        questions: {
          primary: meta.primaryQuestion,
          secondaryTemplate: meta.secondaryQuestionTemplate,
          tertiaryTemplate: meta.tertiaryQuestionTemplate,
        },
        colorGroups,
        nodes: buildTree(), // ✅ now includes inherited colors
        form: {
          questions: buildFormQuestions(),
        },
      },
      message: "Feelings wheel data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching feelings wheel:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error fetching feelings wheel: " + error.message,
    });
  }
};

// ============ ADMIN API (Requires Auth) ============

/**
 * GET /api/admin/feelings-wheel/nodes
 * List nodes with filters
 */
const listNodes = async (req, res) => {
  try {
    const { parentKey, type, colorGroup, isActive } = req.query;
    const filter = {};

    if (parentKey !== undefined) {
      filter.parentKey = parentKey === "null" ? null : parentKey;
    }
    if (type) filter.type = type;
    if (colorGroup) filter.colorGroup = colorGroup;
    if (isActive) filter.isActive = isActive === "true";

    const allNodes = await FeelingNode.find({ isActive: true })
      .lean()
      .sort({ order: 1, key: 1 });

    // 🔥 Create map for fast lookup
    const nodeMap = {};
    allNodes.forEach((n) => {
      nodeMap[n.key] = n;
    });

    // 🔥 Function to get inherited color
    const getColor = (node) => {
      let current = node;

      while (current) {
        if (current.colorGroup && current.hexCode?.inner) {
          return {
            colorGroup: current.colorGroup,
            hexCode: current.hexCode,
          };
        }
        current = nodeMap[current.parentKey];
      }

      return { colorGroup: null, hexCode: null };
    };

    // 🔥 Apply filter + enrich data
    const filteredNodes = allNodes
      .filter((node) => {
        if (
          filter.parentKey !== undefined &&
          node.parentKey !== filter.parentKey
        )
          return false;
        if (filter.type && node.type !== filter.type) return false;
        if (filter.isActive !== undefined && node.isActive !== filter.isActive)
          return false;
        if (filter.colorGroup && node.colorGroup !== filter.colorGroup)
          return false;
        return true;
      })
      .map((node) => {
        const inherited = getColor(node);

        return {
          ...node,
          colorGroup: node.colorGroup || inherited.colorGroup,
          hexCode: node.hexCode?.inner ? node.hexCode : inherited.hexCode,
        };
      });

    return res.status(200).json({
      status: "success",
      body: filteredNodes,
      message: "Nodes retrieved successfully",
    });
  } catch (error) {
    console.error("Error listing nodes:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error listing nodes: " + error.message,
    });
  }
};

/**
 * POST /api/admin/feelings-wheel/nodes
 * Create a new node
 */
const createNode = async (req, res) => {
  try {
    let { key, label, type, parentKey, colorGroup, hexCode, order, isActive } =
      req.body;

    // ================= BASIC VALIDATION =================
    if (!key || !label || !type) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "key, label, and type are required",
      });
    }

    // normalize key
    key = key.toLowerCase().trim();

    // ================= UNIQUE KEY =================
    const existingNode = await FeelingNode.findOne({ key });
    if (existingNode) {
      return res.status(400).json({
        status: "error",
        message: `Node with key '${key}' already exists`,
      });
    }

    // ================= TYPE VALIDATION =================
    const allowedTypes = ["primary", "secondary", "tertiary"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid type",
      });
    }

    // ================= HIERARCHY VALIDATION =================
    let parentNode = null;

    if (type === "primary") {
      if (parentKey) {
        return res.status(400).json({
          status: "error",
          message: "Primary node cannot have parent",
        });
      }
      parentKey = null;
    } else {
      if (!parentKey) {
        return res.status(400).json({
          status: "error",
          message: `${type} must have parentKey`,
        });
      }

      parentNode = await FeelingNode.findOne({ key: parentKey });

      if (!parentNode) {
        return res.status(400).json({
          status: "error",
          message: `Parent '${parentKey}' not found`,
        });
      }

      if (type === "secondary" && parentNode.type !== "primary") {
        return res.status(400).json({
          status: "error",
          message: "Secondary must be under primary",
        });
      }

      if (type === "tertiary" && parentNode.type !== "secondary") {
        return res.status(400).json({
          status: "error",
          message: "Tertiary must be under secondary",
        });
      }
    }

    // ================= COLOR RULE =================
    if (type !== "primary") {
      colorGroup = null;
      hexCode = { inner: null, middle: null, outer: null };
    } else {
      if (!colorGroup || !hexCode?.inner) {
        return res.status(400).json({
          status: "error",
          message: "Primary must have colorGroup and hexCode",
        });
      }
    }

    // ================= CREATE =================
    const node = await FeelingNode.create({
      key,
      label,
      type,
      parentKey,
      colorGroup,
      hexCode,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      status: "success",
      body: node,
      message: "Node created successfully",
    });
  } catch (error) {
    console.error("Error creating node:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error creating node: " + error.message,
    });
  }
};

/**
 * PUT /api/admin/feelings-wheel/nodes/:id
 * Update node by MongoDB _id
 */
const updateNode = async (req, res) => {
  try {
    const nodeId = req.params.id;
    const updateData = req.body;

    const node = await FeelingNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({
        status: "error",
        message: "Node not found",
      });
    }

    // Allowed fields
    const allowedUpdates = [
      "label",
      "colorGroup",
      "hexCode",
      "order",
      "isActive",
      "nextQuestionKey",
    ];

    const actualUpdates = {};

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        actualUpdates[key] = updateData[key];
      }
    }

    // ================= RULES =================

    // 1. Color rule
    if (node.type !== "primary") {
      if (actualUpdates.colorGroup || actualUpdates.hexCode) {
        return res.status(400).json({
          status: "error",
          message: "Only primary nodes can have colors",
        });
      }
    }

    // 2. Primary must always have color
    if (node.type === "primary") {
      if (
        actualUpdates.colorGroup === null ||
        (actualUpdates.hexCode && !actualUpdates.hexCode.inner)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Primary must always have valid color",
        });
      }
    }

    // 3. Prevent dangerous nextQuestionKey (optional safety)
    if (actualUpdates.nextQuestionKey) {
      const exists = await FeelingNode.findOne({
        key: actualUpdates.nextQuestionKey.replace("q.", ""),
      });

      if (!exists) {
        return res.status(400).json({
          status: "error",
          message: "Invalid nextQuestionKey",
        });
      }
    }

    // ================= UPDATE =================
    Object.assign(node, actualUpdates);
    await node.save();

    return res.status(200).json({
      status: "success",
      body: node,
      message: "Node updated successfully",
    });
  } catch (error) {
    console.error("Error updating node:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating node: " + error.message,
    });
  }
};

/**
 * DELETE /api/admin/feelings-wheel/nodes/:id
 * Delete node and cascade delete children
 */
const deleteNode = async (req, res) => {
  try {
    const nodeId = req.params.id;

    const node = await FeelingNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({
        status: "error",
        message: "Node not found",
      });
    }

    // ================= RECURSIVE DELETE =================
    const deleteRecursively = async (parentKey) => {
      const children = await FeelingNode.find({ parentKey });

      for (const child of children) {
        await deleteRecursively(child.key);
        await FeelingNode.deleteOne({ _id: child._id });
      }
    };

    await deleteRecursively(node.key);

    // Delete root node
    await FeelingNode.deleteOne({ _id: nodeId });

    return res.status(200).json({
      status: "success",
      message: "Node and all descendants deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting node:", error);
    return res.status(500).json({
      status: "error",
      message: "Error deleting node: " + error.message,
    });
  }
};

/**
 * GET /api/admin/feelings-wheel/meta
 * Get form meta data
 */
const getMeta = async (req, res) => {
  try {
    const meta = await FeelingFormMeta.getSingleton();

    return res.status(200).json({
      status: "success",
      body: meta,
      message: "Meta data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching meta:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error fetching meta: " + error.message,
    });
  }
};

/**
 * PUT /api/admin/feelings-wheel/meta
 * Update form meta data
 */
const updateMeta = async (req, res) => {
  try {
    const {
      title,
      prompt,
      primaryQuestion,
      secondaryQuestionTemplate,
      tertiaryQuestionTemplate,
    } = req.body;

    const meta = await FeelingFormMeta.getSingleton();

    // ========= VALIDATIONS =========

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Title cannot be empty",
      });
    }

    if (prompt !== undefined && !prompt.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Prompt cannot be empty",
      });
    }

    if (primaryQuestion !== undefined && !primaryQuestion.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Primary question cannot be empty",
      });
    }

    // IMPORTANT: enforce {parent}
    if (
      secondaryQuestionTemplate !== undefined &&
      !secondaryQuestionTemplate.includes("{parent}")
    ) {
      return res.status(400).json({
        status: "error",
        message: "Secondary template must include '{parent}'",
      });
    }

    if (
      tertiaryQuestionTemplate !== undefined &&
      !tertiaryQuestionTemplate.includes("{parent}")
    ) {
      return res.status(400).json({
        status: "error",
        message: "Tertiary template must include '{parent}'",
      });
    }

    // ========= UPDATE =========

    if (title !== undefined) meta.title = title.trim();
    if (prompt !== undefined) meta.prompt = prompt.trim();
    if (primaryQuestion !== undefined)
      meta.primaryQuestion = primaryQuestion.trim();

    if (secondaryQuestionTemplate !== undefined)
      meta.secondaryQuestionTemplate = secondaryQuestionTemplate.trim();

    if (tertiaryQuestionTemplate !== undefined)
      meta.tertiaryQuestionTemplate = tertiaryQuestionTemplate.trim();

    await meta.save();

    return res.status(200).json({
      status: "success",
      body: meta,
      message: "Meta data updated successfully",
    });
  } catch (error) {
    console.error("Error updating meta:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating meta: " + error.message,
    });
  }
};

/**
 * GET /api/admin/feelings-wheel/form
 * Admin preview: PDF-like questions + skip logic
 */
const previewForm = async (req, res) => {
  try {
    const meta = await FeelingFormMeta.getSingleton();
    const allNodes = await FeelingNode.find({ isActive: true }).sort({
      order: 1,
    });

    // ========= GROUP DATA (OPTIMIZATION) =========
    const byType = {
      primary: [],
      secondary: [],
      tertiary: [],
    };

    const byParent = {};

    for (const node of allNodes) {
      byType[node.type].push(node);

      if (!byParent[node.parentKey]) {
        byParent[node.parentKey] = [];
      }
      byParent[node.parentKey].push(node);
    }

    const questions = [];

    // ========= PRIMARY =========
    questions.push({
      key: "q.primary",
      text: meta.primaryQuestion,
      options: byType.primary.map((p) => ({
        key: p.key,
        label: p.label,
        colorGroup: p.colorGroup,
        hexCode: p.hexCode,
        nextQuestionKey: `q.secondary.${p.key}`,
      })),
    });

    // ========= SECONDARY =========
    for (const primary of byType.primary) {
      const secondaries = byParent[primary.key] || [];

      if (!secondaries.length) continue;

      questions.push({
        key: `q.secondary.${primary.key}`,
        text: meta.secondaryQuestionTemplate.replace("{parent}", primary.label),
        options: secondaries.map((s) => ({
          key: s.key,
          label: s.label,
          colorGroup: primary.colorGroup, // inherit color
          nextQuestionKey: `q.tertiary.${s.key}`,
        })),
      });
    }

    // ========= TERTIARY =========
    for (const secondary of byType.secondary) {
      const tertiaries = byParent[secondary.key] || [];

      if (!tertiaries.length) continue;

      // get parent primary for color
      const primaryKey = secondary.parentKey;
      const primary = byType.primary.find((p) => p.key === primaryKey);

      questions.push({
        key: `q.tertiary.${secondary.key}`,
        text: meta.tertiaryQuestionTemplate.replace(
          "{parent}",
          secondary.label,
        ),
        options: tertiaries.map((t) => ({
          key: t.key,
          label: t.label,
          colorGroup: primary?.colorGroup || null,
          nextQuestionKey: null,
        })),
      });
    }

    return res.status(200).json({
      status: "success",
      body: {
        title: meta.title,
        prompt: meta.prompt,
        questions,
      },
      message: "Form preview retrieved successfully",
    });
  } catch (error) {
    console.error("Error generating form preview:", error);
    return res.status(500).json({
      status: "error",
      message: "Error generating form preview: " + error.message,
    });
  }
};

module.exports = {
  getFeelingsWheel,
  listNodes,
  createNode,
  updateNode,
  deleteNode,
  getMeta,
  updateMeta,
  previewForm,
};
