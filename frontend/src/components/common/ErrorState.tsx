type ErrorStateProps = {
  message?: string;
};

export const ErrorState = ({ message = "Something went wrong." }: ErrorStateProps) => (
  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{message}</div>
);
