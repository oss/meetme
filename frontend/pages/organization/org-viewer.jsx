function OrgViewer({ calendars, members, pendingMembers, orgData }) {
    return (
        <div className="h-full bg-neutral-100 flex justify-center">
            <div className="w-10/12">
                <div className="flex flex-col items-center my-4">
                    <p className="text-center text-3xl font-semibold my-3">
                        {orgData.name}
                    </p>
                </div>
                <div className="w-full md:grid md:grid-cols-2 md:gap-5">
                    <div className="w-full h-full">
                        <Tile title="Members" fullHeight={true}>
                            <div className="py-2 flex flex-wrap">
                                {members.map((member) => {
                                    return (
                                        <p
                                            key={member._id}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                        >
                                            {member._id}
                                        </p>
                                    );
                                })}
                                {members.length == 0
                                    ? "No members added yet"
                                    : ""}
                            </div>
                        </Tile>
                    </div>
                    <div className="w-full h-full">
                        <Tile title="Calendars" fullHeight={true}>
                            <div className="py-2 flex flex-wrap">
                                {calendars.map((calendar) => {
                                    return (
                                        <Link
                                            key={calendar._id + "1"}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                            to={"/cal/" + calendar._id}
                                        >
                                            {calendar.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </Tile>
                    </div>
                    <div className="w-full h-fit">
                        <Tile title="Pending Members">
                            <div className="py-2 flex flex-wrap">
                                {pendingMembers.map((pendingMember) => {
                                    return (
                                        <p
                                            key={pendingMember._id}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                        >
                                            {pendingMember._id}
                                        </p>
                                    );
                                })}
                            </div>
                        </Tile>
                    </div>
                    <div className="w-full h-full"></div>
                </div>
            </div>
        </div>
    );
}

export default OrgViewer;
