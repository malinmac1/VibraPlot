from firebase_functions import https_fn
from firebase_admin import initialize_app, auth, db
import datetime
from flask import make_response
from google.cloud import tasks_v2
from google.protobuf import duration_pb2, timestamp_pb2

initialize_app()

# Function for scheduling user deletion
@https_fn.on_request()
def schedule(req: https_fn.Request) -> tasks_v2.Task:

    # Get the uid from the request
    uid = req.args.get("uid")
    if not uid:
        resp = https_fn.Response("Missing uid", status=400)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    else:
        print("Reiceved uid")

    # Task properies
    project = "vibraplot"
    location = "europe-central2"
    queue = "Accounts"
    url = "https://us-central1-vibraplot.cloudfunctions.net/delete"
    scheduled_seconds_from_now = 600

    # Create a client
    client = tasks_v2.CloudTasksClient()

    # Construct the task
    task = tasks_v2.Task(
        http_request=tasks_v2.HttpRequest(
            http_method=tasks_v2.HttpMethod.POST,
            url=url,
            headers={"Content-type": "text/plain"},
            body=uid.encode(),
        ),
    )

    # Convert "seconds from now" to an absolute Protobuf Timestamp
    if scheduled_seconds_from_now is not None:
        timestamp = timestamp_pb2.Timestamp()
        timestamp.FromDatetime(
            datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=scheduled_seconds_from_now)
        )
        task.schedule_time = timestamp

    # Use the client to send a CreateTaskRequest.
    client.create_task(
        tasks_v2.CreateTaskRequest(
            parent=client.queue_path(project, location, queue),
            task=task,
        )
    )

    resp = https_fn.Response("Task created", status=200)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

# Function for deleting the user
@https_fn.on_request()
def delete(req: https_fn.Request) -> https_fn.Response:
    # Read the raw body as bytes and decode to string
    print("Received user deletion request")
    uid = req.data.decode("utf-8").strip()
    try:
        # Delete user data from Realtime Database
        db.reference(f"values/{uid}").delete()
        print("User data deleted")

        # Delete user and task
        auth.delete_user(uid)
        print("User deleted")
        resp = https_fn.Response("User and data deleted", status=200)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    except Exception as e:
        resp = https_fn.Response(f"Error: {str(e)}", status=500)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        print(f"Error deleting user: {str(e)}")
        return resp