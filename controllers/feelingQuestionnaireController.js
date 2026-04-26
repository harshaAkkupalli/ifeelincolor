// controllers/feelingQuestionnaireController.js
const FeelingQuestionnaire = require("../models/FeelingQuestionnaire");

const FeelingNode = require("../models/feelingsWheel");
const FeelingFormMeta = require("../models/FeelingFormMeta");

/**
 * GET /api/admin/feeling-questionnaire
 * List all feeling questionnaires with filters
 */
const listQuestionnaires = async (req, res) => {
  try {
    const { isActive, bodyPart, feelingNodeKey } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    if (bodyPart) {
      filter.bodyPart = bodyPart;
    }
    if (feelingNodeKey) {
      filter.feelingNodeKey = feelingNodeKey;
    }

    const questionnaires = await FeelingQuestionnaire.find(filter)
      .populate("bodyPart", "partName description")
      .sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      status: "success",
      body: questionnaires,
      message: "Questionnaires retrieved successfully",
    });
  } catch (error) {
    console.error("Error listing questionnaires:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error listing questionnaires: " + error.message,
    });
  }
};

/**
 * GET /api/admin/feeling-questionnaire/:id
 * Get a single feeling questionnaire by ID
 */
const getQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;

    const questionnaire = await FeelingQuestionnaire.findById(id).populate(
      "bodyPart",
      "partName description",
    );

    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Questionnaire not found",
      });
    }

    return res.status(200).json({
      status: "success",
      body: questionnaire,
      message: "Questionnaire retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting questionnaire:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error getting questionnaire: " + error.message,
    });
  }
};

/**
 * POST /api/admin/feeling-questionnaire
 * Create a new feeling questionnaire (bodyPart is optional)
 */
const createQuestionnaire = async (req, res) => {
  try {
    const {
      title,
      description,
      bodyPart,
      feelingNodeKey,
      mainColor,
      displayLevel,
      customQuestion,
      order,
    } = req.body;

    // Validation
    if (!title || title.trim() === "") {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "Title is required",
      });
    }

    if (!feelingNodeKey || feelingNodeKey.trim() === "") {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "Feeling node key is required",
      });
    }

    // Check for duplicate title
    const existingQuestionnaire = await FeelingQuestionnaire.findOne({
      title: title.trim(),
    });
    if (existingQuestionnaire) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "A questionnaire with this title already exists",
      });
    }

    // Prepare questionnaire data
    const questionnaireData = {
      title: title.trim(),
      description: description?.trim() || "",
      feelingNodeKey: feelingNodeKey.trim(),
      mainColor: mainColor || "#FF6B6B",
      displayLevel: displayLevel || "full",
      customQuestion: customQuestion?.trim() || "",
      order: order || 0,
      isActive: true,
    };

    // Only add bodyPart if it has a value (optional)
    if (bodyPart && bodyPart.trim() !== "") {
      questionnaireData.bodyPart = bodyPart;
    }

    const questionnaire = await FeelingQuestionnaire.create(questionnaireData);

    // Populate the bodyPart for response if it exists
    if (questionnaire.bodyPart) {
      await questionnaire.populate("bodyPart", "partName description");
    }

    return res.status(201).json({
      status: "success",
      body: questionnaire,
      message: "Questionnaire created successfully",
    });
  } catch (error) {
    console.error("Error creating questionnaire:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "A questionnaire with this title already exists",
      });
    }

    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error creating questionnaire: " + error.message,
    });
  }
};

/**
 * PUT /api/admin/feeling-questionnaire/:id
 * Update an existing feeling questionnaire (bodyPart is optional)
 */
const updateQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      bodyPart,
      feelingNodeKey,
      mainColor,
      displayLevel,
      customQuestion,
      order,
      isActive,
    } = req.body;

    // Find existing questionnaire
    const questionnaire = await FeelingQuestionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Questionnaire not found",
      });
    }

    // Check for duplicate title (excluding current document)
    if (title && title.trim() !== questionnaire.title) {
      const existingQuestionnaire = await FeelingQuestionnaire.findOne({
        title: title.trim(),
        _id: { $ne: id },
      });
      if (existingQuestionnaire) {
        return res.status(400).json({
          status: "error",
          body: null,
          message: "A questionnaire with this title already exists",
        });
      }
    }

    // Update fields
    if (title !== undefined) questionnaire.title = title.trim();
    if (description !== undefined)
      questionnaire.description = description?.trim() || "";
    if (feelingNodeKey !== undefined)
      questionnaire.feelingNodeKey = feelingNodeKey.trim();
    if (mainColor !== undefined) questionnaire.mainColor = mainColor;
    if (displayLevel !== undefined) questionnaire.displayLevel = displayLevel;
    if (customQuestion !== undefined)
      questionnaire.customQuestion = customQuestion?.trim() || "";
    if (order !== undefined) questionnaire.order = order;
    if (isActive !== undefined) questionnaire.isActive = isActive;

    // Handle bodyPart update - can be null/empty to remove the association
    if (bodyPart !== undefined) {
      if (bodyPart && bodyPart.trim() !== "") {
        questionnaire.bodyPart = bodyPart;
      } else {
        questionnaire.bodyPart = null; // Remove body part association
      }
    }

    await questionnaire.save();

    // Populate bodyPart if it exists
    if (questionnaire.bodyPart) {
      await questionnaire.populate("bodyPart", "partName description");
    }

    return res.status(200).json({
      status: "success",
      body: questionnaire,
      message: "Questionnaire updated successfully",
    });
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error updating questionnaire: " + error.message,
    });
  }
};

/**
 * DELETE /api/admin/feeling-questionnaire/:id
 * Delete a feeling questionnaire
 */
const deleteQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;

    const questionnaire = await FeelingQuestionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Questionnaire not found",
      });
    }

    await questionnaire.deleteOne();

    return res.status(200).json({
      status: "success",
      body: null,
      message: "Questionnaire deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error deleting questionnaire: " + error.message,
    });
  }
};

/**
 * PATCH /api/admin/feeling-questionnaire/:id/toggle-status
 * Toggle active status of a questionnaire
 */
const toggleQuestionnaireStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const questionnaire = await FeelingQuestionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        body: null,
        message: "Questionnaire not found",
      });
    }

    questionnaire.isActive = !questionnaire.isActive;
    await questionnaire.save();

    return res.status(200).json({
      status: "success",
      body: questionnaire,
      message: `Questionnaire ${questionnaire.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling questionnaire status:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error toggling questionnaire status: " + error.message,
    });
  }
};

/**
 * POST /api/admin/feeling-questionnaire/reorder
 * Reorder multiple questionnaires (bulk order update)
 */
const reorderQuestionnaires = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        status: "error",
        body: null,
        message: "Orders array is required",
      });
    }

    const updatePromises = orders.map(({ id, order }) =>
      FeelingQuestionnaire.findByIdAndUpdate(id, { order }, { new: true }),
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      status: "success",
      body: null,
      message: "Questionnaires reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering questionnaires:", error);
    return res.status(500).json({
      status: "error",
      body: null,
      message: "Error reordering questionnaires: " + error.message,
    });
  }
};

// ==========================================
// GET /api/feeling-questionnaire/questions/:id
// Production Ready API
// ==========================================

const getFeelingQuestionsByQuestionnaireId = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find questionnaire
    const questionnaire = await FeelingQuestionnaire.findById(id)
      .populate("bodyPart", "partName")
      .lean();

    if (!questionnaire) {
      return res.status(404).json({
        status: "error",
        message: "Questionnaire not found",
      });
    }

    // 2. Get question templates
    const meta = await FeelingFormMeta.getSingleton();

    // 3. Get all nodes
    const nodes = await FeelingNode.find({ isActive: true }).lean();

    const nodeMap = {};
    const childrenMap = {};

    nodes.forEach((node) => {
      nodeMap[node.key] = node;

      if (node.parentKey) {
        if (!childrenMap[node.parentKey]) {
          childrenMap[node.parentKey] = [];
        }
        childrenMap[node.parentKey].push(node);
      }
    });

    // 4. Start node
    const rootNode = nodeMap[questionnaire.feelingNodeKey];

    if (!rootNode) {
      return res.status(404).json({
        status: "error",
        message: "Starting feeling node not found",
      });
    }

    const questions = [];

    // ==========================================
    // PRIMARY QUESTION
    // ==========================================
    if (
      questionnaire.displayLevel === "full" ||
      questionnaire.displayLevel === "primary"
    ) {
      questions.push({
        questionId: rootNode.key,
        level: "primary",
        question:
          questionnaire.customQuestion?.trim() ||
          meta.primaryQuestion ||
          "How are you feeling today?",
        options: [
          {
            key: rootNode.key,
            label: rootNode.label,
            colorGroup: rootNode.colorGroup,
            hexCode: rootNode.hexCode,
          },
        ],
      });
    }

    // ==========================================
    // SECONDARY QUESTION
    // ==========================================
    const secondaryNodes = childrenMap[rootNode.key] || [];

    if (
      secondaryNodes.length > 0 &&
      (questionnaire.displayLevel === "full" ||
        questionnaire.displayLevel === "secondary")
    ) {
      questions.push({
        questionId: `${rootNode.key}_secondary`,
        level: "secondary",
        question: meta.secondaryQuestionTemplate.replace(
          "{parent}",
          rootNode.label.toLowerCase(),
        ),
        options: secondaryNodes.map((item) => ({
          key: item.key,
          label: item.label,
          colorGroup: item.colorGroup,
          hexCode: item.hexCode,
        })),
      });
    }

    // ==========================================
    // TERTIARY QUESTIONS
    // ==========================================
    if (
      questionnaire.displayLevel === "full" ||
      questionnaire.displayLevel === "tertiary"
    ) {
      for (const secondary of secondaryNodes) {
        const tertiaryNodes = childrenMap[secondary.key] || [];

        if (tertiaryNodes.length > 0) {
          questions.push({
            questionId: `${secondary.key}_tertiary`,
            level: "tertiary",
            parentKey: secondary.key,
            question: meta.tertiaryQuestionTemplate.replace(
              "{parent}",
              secondary.label.toLowerCase(),
            ),
            options: tertiaryNodes.map((item) => ({
              key: item.key,
              label: item.label,
              colorGroup: item.colorGroup,
              hexCode: item.hexCode,
            })),
          });
        }
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.status(200).json({
      status: "success",
      body: {
        questionnaireId: questionnaire._id,
        title: questionnaire.title,
        description: questionnaire.description,
        bodyPart: questionnaire.bodyPart || null,
        feelingNodeKey: questionnaire.feelingNodeKey,
        displayLevel: questionnaire.displayLevel,
        totalQuestions: questions.length,
        questions,
      },
      message: "Questions fetched successfully",
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  listQuestionnaires,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  toggleQuestionnaireStatus,
  reorderQuestionnaires,
  getFeelingQuestionsByQuestionnaireId,
};
