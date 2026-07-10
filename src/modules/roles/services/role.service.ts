import Role from "@/modules/roles/schemas/Role";

export class RoleService {
  static async getRoles(companyId?: string) {
    const query = companyId ? { companyId } : {};
    return Role.find(query).sort({ createdAt: -1 });
  }

  static async createRole(data: { name: string; companyId?: string; description?: string; permissions: any; isSystem?: boolean }) {
    return Role.create(data);
  }

  static async updateRole(id: string, data: any) {
    return Role.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteRole(id: string) {
    // Ideally, we shouldn't delete system roles
    const role = await Role.findById(id);
    if (role && role.isSystem) {
      throw new Error("Cannot delete a system role.");
    }
    return Role.findByIdAndDelete(id);
  }
}
