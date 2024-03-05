function BaseButton({ children, onClick , extracss}) {
    return (
        <button type="button"
            className={`
            rounded-lg
            text-center
            font-normal text-sm
            overflow-hidden
            ${extracss}
            `}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
export default BaseButton;
