import { RoadmapService } from '../services/roadmap/roadmapService.js';

export const generateRoadmap = async (req, res, next) => {
  try {
    const inputData = req.validatedBody;
    const roadmap = await RoadmapService.generateRoadmap(inputData);

    return res.status(201).json({
      success: true,
      message: 'Roadmap generated and validated successfully',
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await RoadmapService.getRoadmapById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: `Roadmap with ID '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    next(error);
  }
};
