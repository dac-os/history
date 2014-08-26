# dacos-history v0.0.1

historico escolar do sistema da diretoria academica DAC

- [discipline](#discipline)
	- [Creates a new discipline.](#creates-a-new-discipline.)
	- [Get discipline information.](#get-discipline-information.)
	- [List all system disciplines.](#list-all-system-disciplines.)
	- [Removes discipline.](#removes-discipline.)
	- [Updates discipline information.](#updates-discipline-information.)
	
- [history](#history)
	- [Creates a new history.](#creates-a-new-history.)
	- [Get history information.](#get-history-information.)
	- [List all system histories.](#list-all-system-histories.)
	- [Removes history.](#removes-history.)
	- [Updates history information.](#updates-history-information.)
	


# discipline

## Creates a new discipline.

When creating a new discipline history the user must send the discipline, offering, grade, frequency and
status. The discipline code is used for identifying and must be unique in the system. If a existing code is sent to
this method, a 409 error will be raised. And if no discipline or offering is sent, a 400 error will be raised.

	POST /users/:user/histories/:history/disciplines

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| discipline			| String			|  Discipline code.							|
| offering			| String			|  Discipline offering.							|
| credits			| Number			|  Discipline credits.							|
| grade			| String			|  Discipline grade.							|
| frequency			| Number			|  Discipline frequency.							|
| status			| Number			|  Discipline status.							|

### Success Response

HTTP/1.1 201 Created

```
{}

```
### Error Response

HTTP/1.1 400 Bad Request

```
{
 "discipline": "required",
 "offering": "required"
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
## Get discipline information.

This method returns a single discipline details, the discipline code must be passed in the uri to identify the requested
discipline. If no discipline with the requested code was found, a 404 error will be raised.

	GET /users/:user/histories/:history/disciplines/:discipline


### Success Response

HTTP/1.1 200 OK

```
{
 "discipline": "MC102",
 "offering": "2014-1-A",
 "credits": 6,
 "grade": "10",
 "frequency": 100,
 "status": 5,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}

```
### Error Response

HTTP/1.1 404 Not Found

```
{}

```
## List all system disciplines.

This method returns an array with all disciplines in the database. The data is returned in pages of length 20. If no
page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.

	GET /users/:user/histories/:history/disciplines

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| [Number=0]			|  Requested page.							|

### Success Response

HTTP/1.1 200 OK

```
[{
 "discipline": "MC102",
 "offering": "2014-1-A",
 "credits": 6,
 "grade": "10",
 "frequency": 100,
 "status": 5,
 "createdAt": "2014-07-01T12:22:25.058Z",
 "updatedAt": "2014-07-01T12:22:25.058Z"
}]

```
## Removes discipline.

This method removes a discipline from the system. If no discipline with the requested code was found, a 404 error will be
raised.

	DELETE /users/:user/histories/:history/disciplines/:discipline


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
## Updates discipline information.

When updating a discipline the user must send the discipline, offering, grade, frequency and status. If a existing
code which is not the original discipline code is sent to this method, a 409 error will be raised. And if no
discipline or offering is sent, a 400 error will be raised. If no discipline with the requested code was found, a 404
error will be raised.

	PUT /users/:user/histories/:history/disciplines/:discipline

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| discipline			| String			|  Discipline code.							|
| offering			| String			|  Discipline offering.							|
| credits			| Number			|  Discipline credits.							|
| grade			| String			|  Discipline grade.							|
| frequency			| Number			|  Discipline frequency.							|
| status			| Number			|  Discipline status.							|

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
 "discipline": "required",
 "offering": "required"
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
# history

## Creates a new history.

When creating a new history the user must send the history year, period, course, modality, conclusionLimit and
conclusionDate. The history code is used for identifying and must be unique in the system. If a existing code is sent
to this method, a 409 error will be raised. And if no year, or period, or course or modality is sent, a 400 error
will be raised.

	POST /users/:user/histories

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  History year.							|
| period			| String			|  History period.							|
| course			| String			|  History course.							|
| modality			| String			|  History modality.							|
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
 "course": "required",
 "modality": "required"
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
 "modality": "AA",
 "conclusionLimit": "2017-07-01T12:22:25.058Z",
 "efficiencyCoefficient": 0.98,
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
 "modality": "AA",
 "conclusionLimit": "2017-07-01T12:22:25.058Z",
 "efficiencyCoefficient": 0.98,
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

When updating a history the user must send the history year, period, course, modality, conclusionLimit and
conclusionDate. If a existing code which is not the original history code is sent to this method, a 409 error will be
raised. And if no year, or period, or course or modality is sent, a 400 error will be raised. If no history with the
requested code was found, a 404 error will be raised.

	PUT /users/:user/histories/:history

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| year			| Number			|  History year.							|
| period			| String			|  History period.							|
| course			| String			|  History course.							|
| modality			| String			|  History modality.							|
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
 "year": "required",
 "period": "required",
 "course": "required",
 "modality": "required"
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

