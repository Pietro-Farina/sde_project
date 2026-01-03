import React, { useState } from "react";
import {
	Row,
	Col,
	Grid,
	Space,
	Typography,
	Card,
	Tag,
	Button,
	Drawer,
	Steps,
} from "antd";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const SlotItem = () => {
	return (
		<Card hoverable className="slot-item">
			<Title level={5}>09:00 – 10:00</Title>
            <div className="collapsable-text">
                
                <Text type="secondary">Instructor: John Doe</Text>
                <br />
                <Text type="secondary">Available spots here</Text>
            </div>
		</Card>
	);
};

const DayColumn = ({ day }) => {
	return (
		<div className="day-column">
			<Title level={5} style={{ marginBottom: 12 }}>
				{day.label}
			</Title>

			<Space direction="vertical" size="small" style={{ width: "100%" }}>
				<SlotItem />
				<SlotItem />
				<SlotItem />
			</Space>
		</div>
	);
};

const DaySection = ({ day }) => {
	return (
		<div className="day-section">
			<Title level={4} style={{ marginBottom: 12 }}>
				{day.label}
			</Title>

			<Space direction="vertical" size="small" style={{ width: "100%" }}>
				<SlotItem />
				<SlotItem />
			</Space>
		</div>
	);
};

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

const CourseCalendar = () => {
	const selectedSlots = []; // Replace with state management for selected slots
	const screens = useBreakpoint();

	const columns = screens.lg ? 7 : screens.md ? 3 : 1;

	const [currentStep, setCurrentStep] = useState(0);
	const onChange = (value) => {
		console.log("onChange:", value);
		setCurrentStep(value);
	};

    const sharedProps = {
    type: 'panel',
    current: currentStep,
    onChange,
    items: [
      {
        title: 'Scelta Orario',
        content: 'This is a content.',
      },
      {
        title: 'Riepilogo',
        content: 'This is a content.',
      },
      {
        title: 'Pagamento',
        content: 'This is a content.',
      },
    ],
  };

	return (
		<div className="course-calendar">
			{/* Page header */}
			<Space orientation="vertical" size={4} style={{ marginBottom: 24 }}>
				<Title level={2}>Course Name:</Title>
				<Text type="secondary">
					Course description goes here. Lorem ipsum dolor sit amet,
					consectetur adipiscing elit.
				</Text>
			</Space>

			{/* Course available slots */}
			<div>
				{/* Mobile: vertical list grouped by day */}
				{columns === 1 && (
					<Space
						orientation="vertical"
						size="large"
						style={{ width: "100%" }}
					>
						{days.map((day) => (
							<DaySection
								key={day.key}
								day={day}
								style={{ width: "100%" }}
							/>
						))}
					</Space>
				)}

				{/* Tablet & Desktop: columns per day */}
				{columns > 1 && (
					<Row gutter={12}>
						{days.map((day) => (
							<Col span={24 / columns} key={day.key}>
								<DayColumn day={day} />
							</Col>
						))}
					</Row>
				)}
				{/* Sticky guide */}
				<Card
					size="small"
					style={{
						position: "sticky",
						bottom: 0,
						marginTop: 12,
						zIndex: 10,
					}}
				>
					<Space wrap>
						{selectedSlots.length === 0 ? (
							<span>Select one or more slots</span>
						) : (
							selectedSlots.map((slot) => (
								<Tag key={slot.id}>
									{slot.day} · {slot.start}–{slot.end}
								</Tag>
							))
						)}
					</Space>

					<div style={{ marginTop: 8, textAlign: "right" }}>
						<Button
							type="primary"
							disabled={selectedSlots.length === 0}
						>
							Continue
						</Button>
					</div>
				</Card>
				{/* <div
    style={{
      borderTop: "1px solid #f0f0f0",
      marginTop: 12,
      paddingTop: 12,
    }}
  >
    <Space wrap>
      {selectedSlots.map((slot) => (
        <Tag key={slot.id} closable>
          {slot.start}–{slot.end}
        </Tag>
      ))}
    </Space>
  </div> */}

				{/* <Drawer
  placement="bottom"
  height={120}
  open={selectedSlots.length > 0}
  closable={false}
>
  <Space wrap>
    {selectedSlots.map((s) => (
      <Tag key={s.id}>
        {s.start}–{s.end}
      </Tag>
    ))}
  </Space>

  <Button
    type="primary"
    block
    style={{ marginTop: 8 }}
  >
    Continue
  </Button>
</Drawer> */}
			</div>
		</div>
	);
};

export default CourseCalendar;
