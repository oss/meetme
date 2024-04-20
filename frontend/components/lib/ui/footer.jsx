function Footer() {
    return (
        <div className="flex justify-center p-5 text-sm text-white bg-gray-700">
            <div className="w-3/5 text-center">
                Rutgers is an equal access/equal opportunity institution.
                Individuals with disabilities are encouraged to direct
                suggestions, comments, or complaints concerning any
                accessibility issues with Rutgers websites to
                accessibility@rutgers.edu or complete the{' '}
                <a
                    href="https://rutgers.ca1.qualtrics.com/jfe/form/SV_57iH6Rfeocz51z0"
                    className="text-gray-200"
                >
                    Report Accessibility Barrier / Provide Feedback Form.
                </a>
                <br />© 2023{' '}
                <a href="https://www.rutgers.edu" className="text-gray-200">
                    Rutgers, The State University of New Jersey
                </a>
                . All rights reserved.
            </div>
        </div>
    );
}

export default Footer;
