# dacos-history v0.0.1

historico escolar do sistema da diretoria academica DAC

- [history](#history)
	- [Creates a new history.](#creates-a-new-history.)
	- [Get history information.](#get-history-information.)
	- [List all system histories.](#list-all-system-histories.)
	- [Removes history.](#removes-history.)
	- [Updates history information.](#updates-history-information.)
	


# history

## Creates a new history.

When creating a new history the user must send the history year, period, course, conclusionLimit and conclusionDate.
The history code is used for identifying and must be unique in the system. If a existing code is sent to this method,
a 409 error will be raised. And if no year, or period or course is sent, a 400 error will be raised.

	POST /users/:user/histories

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  History year.							|
| period			| String			|  History period.							|
| course			| String			|  History course.							|
| conclusionLimit			| Date			| **optional** History conclusionLimit.							|
| conclusionDate			| Date			| **optional** History conclusionDate.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "year": "required",
 "period": "required",
 "course": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```
## Get history information.

This method returns a single history details, the history code must be passed in the uri to identify the requested
history. If no history with the requested code was found, a 404 error will be raised.

	GET /users/:user/histories/:history


### Success Response

HTTP/1.1 200 OK

```
{
 "year": 2012,
 "period": "1",
 "course": "42",
 "conclusionLimit": "2017-07-01T12:22:25.058Z",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system histories.

This method returns an array with all histories in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /users/:user/histories

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "year": 2012,
 "period": "1",
 "course": "42",
 "conclusionLimit": "2017-07-01T12:22:25.058Z",
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes history.

This method removes a history from the system. If no history with the requested code was found, a 404 error will be
raised.

	DELETE /users/:user/histories/:history


### Success Response

HTTP/1.1 204 No Content

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 403 Forbidden

```
{}

```
## Updates history information.

When updating a history the user must send the history year, period, course, conclusionLimit and conclusionDate. If
a existing code which is not the original history code is sent to this method, a 409 error will be raised. And if no
year, or period or course is sent, a 400 error will be raised. If no history with the requested code was found, a 404
error will be raised.

	PUT /users/:user/histories/:history

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  History year.							|
| period			| String			|  History period.							|
| course			| String			|  History course.							|
| conclusionLimit			| Date			| **optional** History conclusionLimit.							|
| conclusionDate			| Date			| **optional** History conclusionDate.							|

### Success Response

HTTP/1.1 200 Ok

```
{}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
HTTP/1.1 400 Bad Request

```
{
 "code": "required"
}

```
HTTP/1.1 403 Forbidden

```
{}

```
HTTP/1.1 409 Conflict

```
{}

```

