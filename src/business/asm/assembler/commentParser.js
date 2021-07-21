export default class CommentParser {
    parse(str) {
        let result = {
            hasComment: false,
            comment: null,
            rest: null,
        };
        let index = str
            .replace(/".+"/g, '') // Ignore strings content
            .indexOf('//');
        if (index >= 0) {
            result.hasComment = true;
            result.comment = str.substring(index+2);
            result.rest = str.substring(0, index);
        } else {
            result.rest = str;
        }
        return result;
    }
};