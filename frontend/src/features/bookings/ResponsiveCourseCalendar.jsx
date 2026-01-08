import React from "react";
import { useAppResponsive } from "../../app/providers/ResponsiveProvider";
import "./ResponsiveCourseCalendar.css";
import {
	Row,
	Col,
	Grid,
	Space,
	Typography,
	Card,
	Divider,
	Tag,
	Button,
	Drawer,
	Steps,
} from "antd";

const { Title, Text } = Typography;

// Mock structure – replace with real data
const days = [
	{ key: "mon", label: "Monday" },
	{ key: "tue", label: "Tuesday" },
	{ key: "wed", label: "Wednesday" },
	{ key: "thu", label: "Thursday" },
	{ key: "fri", label: "Friday" },
	{ key: "sat", label: "Saturday" },
	{ key: "sun", label: "Sunday" },
];

const weekdayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDayKey(dateString) {
	const date = new Date(dateString);
	return weekdayMap[date.getDay()];
}

function groupSlotsByDay(slots) {
	return slots.reduce((acc, slot) => {
		const dayKey = getDayKey(slot.start);

		if (!acc[dayKey]) {
			acc[dayKey] = [];
		}

		acc[dayKey].push(slot);
		return acc;
	}, {});
}

function getSlotsPerDay(slots) {
	const grouped = groupSlotsByDay(slots);

	return days.map((day) => ({
		...day,
		slots: grouped[day.key] || [],
	}));
}

function getVisibleDays(days, { isMobile, isTablet, isDesktop }) {
	if (isMobile) {
		return days.filter((day) => day.slots.length > 0);
	} else if (isTablet) {
		// Option B (recommended)
		return days.filter((day) => day.slots.length > 0);
		// Option A → return days
	}

	// Desktop
	return days;
}

const SlotItem = ({ slot, selectedSlotsIds, toggleSlot }) => {
	const isSelected = selectedSlotsIds.includes(slot._id);

	return (
		<Card
			hoverable
			className="slot-item"
			bodyStyle={{ paddingLeft: "12px", paddingRight: "12px" }}
            onClick={() => toggleSlot(slot._id)}
            style={{
                borderColor: isSelected ? "#1890ff" : undefined,
                borderWidth: isSelected ? "2px" : undefined,
            }}
		>
			<Title level={5}>
				{new Date(slot.start).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
				{" – "}
				{new Date(slot.end).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</Title>
			<Text type="secondary">Instructor: John Doe</Text>
			<br />
			<Text type="secondary">Available: {slot.available}</Text>
		</Card>
	);
};

const DaySection = ({ day, slotsPerDay, selectedSlotsIds, toggleSlot }) => {
	return (
		<div className="day-section">
			<Title level={4} style={{ marginBottom: 12 }}>
				{day.label}
			</Title>

			<Space direction="vertical" size="small" style={{ width: "100%" }}>
				{slotsPerDay.map((slot) => (
					<SlotItem
						key={slot._id}
						slot={slot}
						selectedSlotsIds={selectedSlotsIds}
                        toggleSlot={toggleSlot}
					/>
				))}
			</Space>
		</div>
	);
};

const DayColumn = ({ day, slotsPerDay, selectedSlotsIds, toggleSlot }) => {
	return (
		<div className="day-column">
			<Title level={5} style={{ marginBottom: 12 }} className="day-title">
				{day.label}
			</Title>
			<Divider />

			<div className="slots">
				{slotsPerDay.map((slot) => (
					<SlotItem
						key={slot._id}
						slot={slot}
						selectedSlotsIds={selectedSlotsIds}
                        toggleSlot={toggleSlot}
					/>
				))}
			</div>
		</div>
	);
};

const ResponsiveCourseCalendar = ({ selectedSlotsIds, setSelectedSlotsIds, course }) => {
	const { isMobile, isTablet, isDesktop } = useAppResponsive();
    const { slots } = course;

	function toggleSlot(slotId) {
		setSelectedSlotsIds((prev) =>
			prev.includes(slotId)
				? prev.filter((id) => id !== slotId)
				: [...prev, slotId]
		);
	}

	const slotsPerDay = getVisibleDays(getSlotsPerDay(slots), {
		isMobile,
		isTablet,
		isDesktop,
	});

	return (
		<div>
			{isMobile && (
				<Space
					orientation="vertical"
					size="large"
					style={{ width: "100%" }}
				>
					{slotsPerDay.map((day) => (
						<DaySection
							key={day.key}
							day={day}
							slotsPerDay={day.slots}
							selectedSlotsIds={selectedSlotsIds}
                            toggleSlot={toggleSlot}
							style={{ width: "100%" }}
						/>
					))}
				</Space>
			)}
			{(isTablet || isDesktop) && (
				<div
					className={
						isDesktop
							? "calendar-grid-desktop"
							: "calendar-grid-tablet"
					}
					style={isTablet ? {
						gridTemplateColumns: `repeat(${Math.min(slotsPerDay.length, 4)}, minmax(0, 1fr))`
					} : {
						gridTemplateColumns: `repeat(7, minmax(0, 1fr))`
					}}
				>
					{slotsPerDay.map((day) => (
						<DayColumn
							key={day.key}
							day={day}
							slotsPerDay={day.slots}
							selectedSlotsIds={selectedSlotsIds}
							toggleSlot={toggleSlot}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default ResponsiveCourseCalendar;
