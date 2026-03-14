import { UsersTable } from "@/features/users/components/UsersTable";

export function UserTable(props: React.ComponentProps<typeof UsersTable>) {
  return <UsersTable {...props} />;
}
