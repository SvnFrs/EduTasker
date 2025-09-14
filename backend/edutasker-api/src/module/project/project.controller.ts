import type { Request, Response } from "express";
import * as ProjectService from './project.service.js';
import type { CreateProjectDTO, UpdateProjectDTO, ProjectListQuery, AddMemberDTO } from './project.type.js';

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data: CreateProjectDTO = req.body;

    const project = await ProjectService.createProject(data, userId);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listProjects = async (req: Request, res: Response) => {
  try {
    const query: ProjectListQuery = req.query;
    const result = await ProjectService.getAllProjects(query);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await ProjectService.getProjectById(id);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const data: UpdateProjectDTO = req.body;
    const updatedProject = await ProjectService.updateProject(id, data);
    res.json(updatedProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    await ProjectService.deleteProject(id);
    res.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const data: AddMemberDTO = req.body;
    const updatedProject = await ProjectService.addProjectMember(id, data);
    res.json(updatedProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await ProjectService.removeProjectMember(id, userId);
    res.json({ message: "Member removed successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
