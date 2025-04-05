import FaqCollapse from '../components/utils/faq-collapse';

function Faq() {
    return (
        <div
            id="faq-page"
            className="h-full bg-gray-100 flex flex-col items-center p-[20px]"
        >
            <h1
                style={{
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    padding: '10px',
                }}
            >
                Frequently Asked Questions
            </h1>
            <FaqCollapse
                question="What is MeetMe?"
                answer="A web application to help find a time where everyone is available."
            />
            <FaqCollapse
                question="Who should I contact for technical issues?"
                answer="MeetMe is made by Open System Solutions. The best way to contact us is by email at <oss@oit.rutgers.edu>"
            />
            <FaqCollapse
                question="How can I shorten my meetme links?"
                answer="If you are a faculty or staff member, you can use the official Rutgers URL Shortener at go.rutgers.edu."
            />
        </div>
    );
}

export default Faq;