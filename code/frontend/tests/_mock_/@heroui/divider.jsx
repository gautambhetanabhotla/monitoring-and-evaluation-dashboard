import React from 'react';

// jest.mock('@heroui/divider', () => ({
//     Divider: (props) => <hr {...props} />
// }));

const Divider = ({props}) => {
    return (
        <hr {...props} />
    );
};

export { Divider };