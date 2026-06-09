import googleStore from '@store/googleStore';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import RedButton from '@components/utils/red-button';


function GoogleLinkDialogue({ calID }) {
    console.log('google dialogue re-render')

    const googleLink = googleStore((store) => store.googleLink);
    const valid = googleStore((store) => store.valid);

    return (
    <>
        <DialogTitle>{"Link Google Account"}</DialogTitle>
        <Description>
            <p className="text-sm text-gray-500">
                {"This will take you to google to link your account"}
            </p>
            {valid?
                <p className="text-sm text-gray-500">
                {"You have already linked with scarletmail: "}
                </p>:
                ""}
        </Description>
        <div className='h-1' />
        <div className='inline-flex w-full'>
            <div className=''>
                <a href = {googleLink}>
                    <RedButton>
                        {"Go to Google"}
                    </RedButton>
                </a>
            </div>
        </div>
    </>
    )
    
}

export default GoogleLinkDialogue;