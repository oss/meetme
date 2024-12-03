function Footer() {
    return (
        <div className="flex justify-center p-5 text-sm text-white bg-gray-700">
            <div className="w-3/5 text-center">
                Rutgers is an equal access/equal opportunity institution.
                Individuals with disabilities are encouraged to direct
                suggestions, comments, or complaints concerning any
                accessibility issues with Rutgers websites to 
                <a className = "text-gray-300 hover:underline" href="mailto:accessibility@rutgers.edu"> accessibility@rutgers.edu </a> 
                or complete the{' '}
                <a
                    href="https://rutgers.ca1.qualtrics.com/jfe/form/SV_57iH6Rfeocz51z0"
                    className="text-gray-300 hover:underline"
                >
                    Report Accessibility Barrier / Provide Feedback Form.
                </a>
                <br /><a className = "text-gray-300 hover:underline" rel="nofollow" target="_blank" href="https://www.rutgers.edu/copyright-information">Copyright ©2024</a>{' '}
                <a href="https://www.rutgers.edu" className="text-gray-300 hover:underline">
                    Rutgers, The State University of New Jersey
                </a>
                . All rights reserved.
            </div>
        </div>
    );
}

export default Footer;

