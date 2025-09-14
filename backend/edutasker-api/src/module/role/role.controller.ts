import type { Request, Response } from "express";
import * as RoleService from './role.service.js';
import type { CreateRoleDTO, UpdateRoleDTO, RoleListQuery, AssignPermissionsDTO } from './role.type.js';

export const createRole = async (req: Request, res: Response) => {
  try {
    const data: CreateRoleDTO = req.body;

    const role = await RoleService.createRole(data);
    res.status(201).json(role);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listRoles = async (req: Request, res: Response) => {
  try {
    const query: RoleListQuery = req.query;
    const result = await RoleService.getAllRoles(query);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const role = await RoleService.getRoleById(id);
    res.json(role);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const data: UpdateRoleDTO = req.body;
    const updatedRole = await RoleService.updateRole(id, data);
    res.json(updatedRole);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    await RoleService.deleteRole(id);
    res.json({ message: "Role deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const assignPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    const data: AssignPermissionsDTO = req.body;
    const result = await RoleService.assignPermissionsToRole(id, data);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await RoleService.getAllPermissions();
    res.json(permissions);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
