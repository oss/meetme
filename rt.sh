# This function checks the container runtime, assigning a default of podman,
# then docker if the CR variable is empty. If neither podman or docker can be
# found, a empty string is returned and expected to be handled by the caller.
check_runtime() {
	if [ -z "$1" ]; then
		if command -v podman >/dev/null 2>&1; then
			echo "podman"
		elif command -v docker >/dev/null 2>&1; then
			echo "docker"
		else
			>&2 echo "No podman or docker found, please specify a container runtime."
			exit 1
		fi
	fi
	echo "$1"
}
