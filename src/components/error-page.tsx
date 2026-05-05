
import React from "react";
import ErrorRedBox from "./error-red-box";

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
      <ErrorRedBox message={message}/>

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
