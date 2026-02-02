import express from "express";
import {
  aiSuggest,
  analyzeCars,
  compareCarsAI,
  importScrapedCars,
  importScrapedCarsSummary
} from "../controllers/aiController.js";

const aiRoutes = express.Router();

aiRoutes.post("/import-cars", importScrapedCars);
aiRoutes.post("/import-summary", importScrapedCarsSummary);
aiRoutes.post("/analyze", analyzeCars);
aiRoutes.post("/compare", compareCarsAI);
aiRoutes.post("/suggest", aiSuggest);

export default aiRoutes;
