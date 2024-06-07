import dialogueStore from '@store/dialogueStore';
import { useEffect, useState } from 'react';
import TextBarDialogue from '@ui/TextBarDialogue';

function LocationDialogue({ calID }) {
    const closeDialogue = dialogueStore((store) => store.closePanel)
    const [displayError, setDisplayError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('some error message')

    console.log('location dialogue re-render')

    return (
        <TextBarDialogue
            buttonText='Set Location'
            titleText='Set Location For Calendar'
            placeholder='untitled'
            displayError={displayError}
            errorMessage={errorMessage}
            onClickPassthrough={async ({ event, textBarValue }) => {
                const req = await fetch(`${process.env.API_URL}/cal/${calID}/location`, {
                    credentials: 'include', method: 'PATCH', headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ location: textBarValue })
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

export default LocationDialogue;