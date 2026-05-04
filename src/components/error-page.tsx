
import React from "react";

type ErrorStateProps = {
  message: string;
  id?: string | number;
  onRetry?: () => void;
};

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-600 text-sm max-w-sm text-center">
        {message}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
