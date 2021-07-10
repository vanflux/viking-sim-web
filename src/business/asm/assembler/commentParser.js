export default class CommentParser {
    parse(str) {
        let result = {
            isComment: false,
            comment: null,
        };
        let matches = str.match(/^[ \t]*;|(?:\/\/)(.*)/);
        if (Array.isArray(matches) && matches.length === 2) {
            result.isComment = true;
            result.comment = matches[1];
        }
        return result;
    }
};