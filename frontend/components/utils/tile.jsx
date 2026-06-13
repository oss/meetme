function Tile({
    title,
    subtitle = '',
    children,
    fullHeight = false,
    grow = false,
    verticallyCenter = false,
    overflowX = false,
    extracss = '',
    bg_color = 'bg-white',
    default_padding = true,
    default_margin = true,
    buttonTitle = <></>,
}) {
    return (
        <div
            className={`
      ${' ' + bg_color + ' '}
      ${default_padding ? ' px-8 py-5 ' : ''}
      shadow-sm
      ${verticallyCenter ? ' flex flex-col justify-center ' : ' '}
      ${default_margin ? ' mx-2 my-2 ' : ' '}
      rounded-md ${fullHeight ? ' h-full ' : ''}
      ${grow ? ' grow ' : ''}
      ${overflowX ? ' overflow-x-auto ' : ' '}
      ${' ' + extracss}`}
        >
            <div className="flex justify-between items-center">
                <div className="text-gray-600 font-bold">{title}</div>
                {buttonTitle}
            </div>

            {subtitle && (
                <div className="text-gray-500 text-sm">{subtitle}</div>
            )}

            {children}
        </div>
    );
}

export default Tile;
