
interface props {
  message?: string;
}

export default function ErrorRedBox({message}: props) {
  return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-600 text-sm max-w-sm text-center">
        {message}
      </div>
  )
}
