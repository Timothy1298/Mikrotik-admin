export function InlineError({ message }: { message: string }) {
  return <p className="text-sm text-danger">{message}</p>;
}
