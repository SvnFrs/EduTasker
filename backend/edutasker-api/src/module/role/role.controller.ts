import type { Request, Response } from "express";
import { serviceWrapper } from "../../helper/service-wrapper.js";
import * as RoleService from "./role.service.js";
import type { CreateRoleDTO, RoleListQuery, UpdateRoleDTO } from "./role.type.js";

const createRoleHandler = async (req: Request, res: Response) => {
  const data: CreateRoleDTO = req.body;
  return await RoleService.createRole(data);
};

const listRolesHandler = async (req: Request, res: Response) => {
  const query: RoleListQuery = req.query;
  return await RoleService.getAllRoles(query);
};

const getRoleByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Role ID is required");
  }
  return await RoleService.getRoleById(id);
};

const updateRoleHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Role ID is required");
  }
  const data: UpdateRoleDTO = req.body;
  return await RoleService.updateRole(id, data);
};

const deleteRoleHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Role ID is required");
  }
  await RoleService.deleteRole(id);
  return { message: "Role deleted successfully" };
};

export const createRole = serviceWrapper(createRoleHandler, "Role created successfully");
export const listRoles = serviceWrapper(listRolesHandler, "Roles retrieved successfully");
export const getRoleById = serviceWrapper(getRoleByIdHandler, "Role retrieved successfully");
export const updateRole = serviceWrapper(updateRoleHandler, "Role updated successfully");
export const deleteRole = serviceWrapper(deleteRoleHandler, "Role deleted successfully");
