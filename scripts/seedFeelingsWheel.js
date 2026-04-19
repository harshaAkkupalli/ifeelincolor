const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FeelingNode = require("../models/feelingsWheel");
const FeelingFormMeta = require("../models/FeelingFormMeta");

dotenv.config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await FeelingNode.deleteMany({});
    await FeelingFormMeta.deleteMany({});
    console.log("Cleared existing data");

    const data = [
      // ================= PRIMARY =================
      {
        key: "happy",
        label: "Happy",
        type: "primary",
        parentKey: null,
        colorGroup: "yellow",
        order: 1,
        hexCode: { inner: "#FFD700", middle: "#FFF338", outer: "#FFF9C4" },
      },
      {
        key: "sad",
        label: "Sad",
        type: "primary",
        parentKey: null,
        colorGroup: "blue",
        order: 2,
        hexCode: { inner: "#1E90FF", middle: "#87CEEB", outer: "#B3E5FC" },
      },
      {
        key: "disgusted",
        label: "Disgusted",
        type: "primary",
        parentKey: null,
        colorGroup: "grey",
        order: 3,
        hexCode: { inner: "#808080", middle: "#A9A9A9", outer: "#D3D3D3" },
      },
      {
        key: "angry",
        label: "Angry",
        type: "primary",
        parentKey: null,
        colorGroup: "red",
        order: 4,
        hexCode: { inner: "#FF0000", middle: "#FF5252", outer: "#FF8A80" },
      },
      {
        key: "fearful",
        label: "Fearful",
        type: "primary",
        parentKey: null,
        colorGroup: "orange",
        order: 5,
        hexCode: { inner: "#FF8C00", middle: "#FFA726", outer: "#FFCCBC" },
      },
      {
        key: "bad",
        label: "Bad",
        type: "primary",
        parentKey: null,
        colorGroup: "green",
        order: 6,
        hexCode: { inner: "#00A36C", middle: "#66BB6A", outer: "#C8E6C9" },
      },
      {
        key: "surprised",
        label: "Surprised",
        type: "primary",
        parentKey: null,
        colorGroup: "purple",
        order: 7,
        hexCode: { inner: "#8A2BE2", middle: "#AB47BC", outer: "#E1BEE7" },
      },

      // ================= HAPPY =================
      {
        key: "happy.playful",
        label: "Playful",
        type: "secondary",
        parentKey: "happy",
        order: 1,
      },
      {
        key: "happy.content",
        label: "Content",
        type: "secondary",
        parentKey: "happy",
        order: 2,
      },
      {
        key: "happy.interested",
        label: "Interested",
        type: "secondary",
        parentKey: "happy",
        order: 3,
      },
      {
        key: "happy.proud",
        label: "Proud",
        type: "secondary",
        parentKey: "happy",
        order: 4,
      },
      {
        key: "happy.accepted",
        label: "Accepted",
        type: "secondary",
        parentKey: "happy",
        order: 5,
      },
      {
        key: "happy.powerful",
        label: "Powerful",
        type: "secondary",
        parentKey: "happy",
        order: 6,
      },
      {
        key: "happy.peaceful",
        label: "Peaceful",
        type: "secondary",
        parentKey: "happy",
        order: 7,
      },
      {
        key: "happy.trusting",
        label: "Trusting",
        type: "secondary",
        parentKey: "happy",
        order: 8,
      },
      {
        key: "happy.optimistic",
        label: "Optimistic",
        type: "secondary",
        parentKey: "happy",
        order: 9,
      },

      {
        key: "happy.playful.aroused",
        label: "Aroused",
        type: "tertiary",
        parentKey: "happy.playful",
      },
      {
        key: "happy.playful.cheeky",
        label: "Cheeky",
        type: "tertiary",
        parentKey: "happy.playful",
      },

      {
        key: "happy.content.free",
        label: "Free",
        type: "tertiary",
        parentKey: "happy.content",
      },
      {
        key: "happy.content.joyful",
        label: "Joyful",
        type: "tertiary",
        parentKey: "happy.content",
      },

      {
        key: "happy.interested.curious",
        label: "Curious",
        type: "tertiary",
        parentKey: "happy.interested",
      },
      {
        key: "happy.interested.inquisitive",
        label: "Inquisitive",
        type: "tertiary",
        parentKey: "happy.interested",
      },

      {
        key: "happy.proud.successful",
        label: "Successful",
        type: "tertiary",
        parentKey: "happy.proud",
      },
      {
        key: "happy.proud.confident",
        label: "Confident",
        type: "tertiary",
        parentKey: "happy.proud",
      },

      {
        key: "happy.accepted.respected",
        label: "Respected",
        type: "tertiary",
        parentKey: "happy.accepted",
      },
      {
        key: "happy.accepted.valued",
        label: "Valued",
        type: "tertiary",
        parentKey: "happy.accepted",
      },

      {
        key: "happy.powerful.courageous",
        label: "Courageous",
        type: "tertiary",
        parentKey: "happy.powerful",
      },
      {
        key: "happy.powerful.creative",
        label: "Creative",
        type: "tertiary",
        parentKey: "happy.powerful",
      },

      {
        key: "happy.peaceful.loving",
        label: "Loving",
        type: "tertiary",
        parentKey: "happy.peaceful",
      },
      {
        key: "happy.peaceful.thankful",
        label: "Thankful",
        type: "tertiary",
        parentKey: "happy.peaceful",
      },

      {
        key: "happy.trusting.sensitive",
        label: "Sensitive",
        type: "tertiary",
        parentKey: "happy.trusting",
      },
      {
        key: "happy.trusting.intimate",
        label: "Intimate",
        type: "tertiary",
        parentKey: "happy.trusting",
      },

      {
        key: "happy.optimistic.hopeful",
        label: "Hopeful",
        type: "tertiary",
        parentKey: "happy.optimistic",
      },
      {
        key: "happy.optimistic.inspired",
        label: "Inspired",
        type: "tertiary",
        parentKey: "happy.optimistic",
      },

      // ================= SAD =================
      {
        key: "sad.lonely",
        label: "Lonely",
        type: "secondary",
        parentKey: "sad",
      },
      {
        key: "sad.vulnerable",
        label: "Vulnerable",
        type: "secondary",
        parentKey: "sad",
      },
      {
        key: "sad.despair",
        label: "Despair",
        type: "secondary",
        parentKey: "sad",
      },
      {
        key: "sad.guilty",
        label: "Guilty",
        type: "secondary",
        parentKey: "sad",
      },
      {
        key: "sad.depressed",
        label: "Depressed",
        type: "secondary",
        parentKey: "sad",
      },
      { key: "sad.hurt", label: "Hurt", type: "secondary", parentKey: "sad" },

      {
        key: "sad.lonely.isolated",
        label: "Isolated",
        type: "tertiary",
        parentKey: "sad.lonely",
      },
      {
        key: "sad.lonely.abandoned",
        label: "Abandoned",
        type: "tertiary",
        parentKey: "sad.lonely",
      },

      {
        key: "sad.vulnerable.victimized",
        label: "Victimized",
        type: "tertiary",
        parentKey: "sad.vulnerable",
      },
      {
        key: "sad.vulnerable.fragile",
        label: "Fragile",
        type: "tertiary",
        parentKey: "sad.vulnerable",
      },

      {
        key: "sad.despair.grief",
        label: "Grief",
        type: "tertiary",
        parentKey: "sad.despair",
      },
      {
        key: "sad.despair.powerless",
        label: "Powerless",
        type: "tertiary",
        parentKey: "sad.despair",
      },

      {
        key: "sad.guilty.ashamed",
        label: "Ashamed",
        type: "tertiary",
        parentKey: "sad.guilty",
      },
      {
        key: "sad.guilty.remorseful",
        label: "Remorseful",
        type: "tertiary",
        parentKey: "sad.guilty",
      },

      {
        key: "sad.depressed.inferior",
        label: "Inferior",
        type: "tertiary",
        parentKey: "sad.depressed",
      },
      {
        key: "sad.depressed.empty",
        label: "Empty",
        type: "tertiary",
        parentKey: "sad.depressed",
      },

      {
        key: "sad.hurt.embarrassed",
        label: "Embarrassed",
        type: "tertiary",
        parentKey: "sad.hurt",
      },
      {
        key: "sad.hurt.disappointed",
        label: "Disappointed",
        type: "tertiary",
        parentKey: "sad.hurt",
      },

      // (Rest follows same pattern...)
    ];

    await FeelingNode.insertMany(data, { ordered: false });
    console.log("✅ Nodes inserted");

    await FeelingFormMeta.create({
      title: "Feelings Wheel",
      prompt: "How are you feeling today?",
      primaryQuestion: "How are you feeling today?",
      secondaryQuestionTemplate:
        "What type of {parent} feeling are you feeling?",
      tertiaryQuestionTemplate:
        "Which type of {parent} feeling are you feeling?",
    });

    console.log("✅ Meta created");
    console.log("🎉 SEED SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

seedData();
