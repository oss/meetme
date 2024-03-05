import BaseButton from "./base-button";
function RedButton({ children, onClick }) {
    return (
        <BaseButton onClick={onClick} extracss="bg-red-500 hover:bg-red-600 text-white
        transition-colors duration-200
        py-1 px-1 border">
                {children}
        </BaseButton>
    );
}
export default RedButton;
