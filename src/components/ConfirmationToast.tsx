export interface ToastProps {
    message: string
    onConfirm: () => void
    onCancel: () => void
    onClose: () => void
    closeToast: () => void
}

const ConfirmationToast = ({ message, onConfirm, onCancel, closeToast }: ToastProps) => {
    const handleConfirm = () => {
        onConfirm();
        closeToast();
    };

    const handleCancel = () => {
        onCancel();
        closeToast();
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-80 max-w-full">
            <p className="text-gray-800 dark:text-gray-100 mb-4 text-sm">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                >
                    Yes
                </button>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                >
                    No
                </button>
            </div>
        </div>
    );
};


export default ConfirmationToast;