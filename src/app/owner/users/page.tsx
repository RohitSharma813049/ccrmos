import UsersClient from "@/modules/users/components/UsersClient";

export default function OwnerUsersPage() {
  return <UsersClient isOwner={true} />;
}
