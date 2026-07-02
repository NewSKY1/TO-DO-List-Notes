// reminders.js — notification toggle + due-task reminder checks.
import { load, save, KEYS } from './storage.js';
import { tasks, saveTasks } from './state.js';

export let notifyEnabled = load(KEYS.NOTIFY, false);

export async function toggleNotify() {
	if (!notifyEnabled && 'Notification' in window && Notification.permission === 'default') {
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return notifyEnabled;
	}

	notifyEnabled = !notifyEnabled;
	save(KEYS.NOTIFY, notifyEnabled);
	return notifyEnabled;
}

function isDueSoon(task) {
	if (!task || task.completed || !task.dueDate) return false;
	const due = new Date(task.dueAt || `${task.dueDate}T${task.dueTime || '23:59:59'}`);
	return due.getTime() <= Date.now() + 24 * 60 * 60 * 1000;
}

export function checkReminders() {
	if (!notifyEnabled || !('Notification' in window) || Notification.permission !== 'granted') return 0;

	let sent = 0;
	tasks.forEach(task => {
		if (!isDueSoon(task) || task.notifiedAt) return;
		try {
			new Notification('Orbit reminder', {
				body: task.text,
				tag: task.id,
			});
			task.notifiedAt = Date.now();
			sent += 1;
		} catch (error) {
			console.error('Reminder notification failed', error);
		}
	});

	if (sent > 0) saveTasks();
	return sent;
}
