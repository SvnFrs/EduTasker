import type { Request, Response } from "express";
import * as ProjectService from "./project.service.js";
import type {
  AddMemberDTO,
  CreateProjectDTO,
  ProjectListQuery,
  UpdateProjectDTO,
} from "./project.type.js";
import { serviceWrapper } from "../../helper/service-wrapper.js";

const createProjectHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const data: CreateProjectDTO = req.body;
  return await ProjectService.createProject(data, userId);
};

const listProjectsHandler = async (req: Request, res: Response) => {
  const query: ProjectListQuery = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: req.query.search as string,
    status: req.query.status as string,
    createdBy: req.query.createdBy as string,
    userId: req.query.userId as string,
    deadline: req.query.deadline as "upcoming" | "overdue" | "this-week" | "this-month",
  };
  return await ProjectService.getAllProjects(query);
};

const getProjectByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Project ID is required");
  }
  return await ProjectService.getProjectById(id);
};

const updateProjectHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Project ID is required");
  }
  const data: UpdateProjectDTO = req.body;
  return await ProjectService.updateProject(id, data);
};

const deleteProjectHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Project ID is required");
  }
  await ProjectService.deleteProject(id);
  return { message: "Project deleted successfully" };
};

const addMemberHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Project ID is required");
  }
  const data: AddMemberDTO = req.body;
  return await ProjectService.addProjectMember(id, data);
};

const removeMemberHandler = async (req: Request, res: Response) => {
  const { id, userId } = req.params;
  if (!id) {
    throw new Error("Project ID is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }
  await ProjectService.removeProjectMember(id, userId);
  return { message: "Member removed successfully" };
};

const getMyProjectsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const query: Partial<ProjectListQuery> = {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: req.query.search as string,
    status: req.query.status as string,
    deadline: req.query.deadline as "upcoming" | "overdue" | "this-week" | "this-month",
  };
  return await ProjectService.getMyProjects(userId, query);
};

export const createProject = serviceWrapper(createProjectHandler, "Project created successfully");
export const listProjects = serviceWrapper(listProjectsHandler, "Projects retrieved successfully");
export const getProjectById = serviceWrapper(
  getProjectByIdHandler,
  "Project retrieved successfully",
);
export const updateProject = serviceWrapper(updateProjectHandler, "Project updated successfully");
export const deleteProject = serviceWrapper(deleteProjectHandler, "Project deleted successfully");
export const addMember = serviceWrapper(addMemberHandler, "Member added successfully");
export const removeMember = serviceWrapper(removeMemberHandler, "Member removed successfully");
export const getMyProjects = serviceWrapper(
  getMyProjectsHandler,
  "My projects retrieved successfully",
);
