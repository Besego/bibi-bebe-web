export function saveSpace(space) {
    try {
        localStorage.setItem('current_space', JSON.stringify(space));
    } catch (error) {
        console.error('Error saving space:', error);
    }
}

export function getSpace() {
    try {
        const spaceString = localStorage.getItem('current_space');
        if (spaceString) {
            return JSON.parse(spaceString);
        }
        return null;
    } catch (error) {
        console.error('Error getting space:', error);
        return null;
    }
}

export function getCurrentSpaceId() {
    try {
        const spaceString = localStorage.getItem('current_space');
        if (!spaceString) return null;
        const space = JSON.parse(spaceString);
        return space.space_id;
    } catch (error) {
        console.error('Error getting current space ID:', error);
        return null;
    }
}