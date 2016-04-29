module.exports = function (request, response, next, id) {
    request.single("employees", { initial: id })
        .then(doc => {
            if (doc == null)
                next(new Error("employee not found"));
            else {
                response.locals.employee = doc;
            }
            next()
        })
        .catch(e => next(e));
}