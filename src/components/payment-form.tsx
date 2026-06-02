import { useToast } from "./toast";

type PaymentFormProps = {

}

export function PaymentForm({}: PaymentFormProps) {
  const {showToast} = useToast()
  const handlePayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    showToast("error", "Payment Gateaway Not Yet Supported")
  };

  return (
    <div>
      <h1 className="font-semibold text-xl mb-2">There Is Pending Payment For This Order, Process Payment To Continue</h1>
      <div className="mt-4 w-full flex items-center justify-end gap-3">
        <button 
            onClick={() => handlePayment()}
            className="rounded-xl bg-gray-800 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition" > 
            Continue Payment
        </button>
      </div>

    </div>
  )

}
