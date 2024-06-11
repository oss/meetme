import { useRef } from 'react';
import { Dialog } from '@headlessui/react';
import RedButton from '../../utils/red-button';

function TextBarDialogue({ buttonText, titleText, onClickPassthrough, displayError, errorMessage = '', placeholder = '', description = '' }) {
    const textBarRef = useRef(null)

    const onClickHandler = (event) => {
        onClickPassthrough({ event: event,textBarValue: textBarRef.current.value })
    }

    return (
        <>
            <Dialog.Title>{titleText}</Dialog.Title>
            <Dialog.Description>
                <p className="text-sm text-gray-500">
                    {description}
                </p>
            </Dialog.Description>
            <div className='h-1' />
            <input type="text" className="
                    w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:border-sky-500 focus:ring-1 focus:ring-sky-500" placeholder={placeholder} ref={textBarRef} />
            <div className='h-1' />
            <div className='inline-flex w-full'>
                <p className="grow min-w-5 text-xs text-rutgers_red inline text-clip break-words">
                    {displayError ? errorMessage : <></>}
                </p>
                <div className=''>
                    <RedButton onClick={onClickHandler}>
                        {buttonText}
                    </RedButton>
                </div>
            </div>
        </>
    )
}

export default TextBarDialogue;