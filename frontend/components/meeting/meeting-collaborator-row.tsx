import React from 'react';

interface IMeetingCollaboratorRow {
  name: string;
}

// This is in it's own component incase we add profile pictures or something..
function MeetingCollaboratorRow(props: IMeetingCollaboratorRow) {
  return (
    <div>
      <p>{props.name}</p>
    </div>
  );
}

export default MeetingCollaboratorRow;
