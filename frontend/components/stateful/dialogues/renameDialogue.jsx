import dialogueStore from '@store/dialogueStore';
import { useState } from 'react';
import TextBarDialogue from '@ui/TextBarDialogue';

function RenameDialogue({ calID }) {
    const closeDialogue = dialogueStore((store) => store.closePanel)
    const [displayError, setDisplayError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('some error message')

    return (
        <TextBarDialogue
            buttonText='Rename'
            titleText='Rename Calendar'
            placeholder='untitled'
            displayError={displayError}
            errorMessage={errorMessage}
            onClickPassthrough={async ({ event, textBarValue }) => {
                const req = await fetch(`${process.env.API_URL}/cal/${calID}/name`, {
                    credentials: 'include', method: 'PATCH', headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ new_name: textBarValue })
                });
                const resp = await req.json()
                if (resp.Status === 'ok') {
                    console.log(resp)
                    closeDialogue()
                }
                else {
                    setErrorMessage(resp.error)
                    setDisplayError(true)
                }
            }} />
    )
}

export default RenameDialogue;