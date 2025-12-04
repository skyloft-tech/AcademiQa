# file: runtime.sh  (repo root)
#!/usr/bin/env bash
set -euo pipefail
cd task_manager
python manage.py migrate --noinput
python manage.py collectstatic --noinput
# log requests to stdout to see hits from the edge
exec daphne --access-log - -b 0.0.0.0 -p "${PORT:-8000}" task_manager.asgi:application
