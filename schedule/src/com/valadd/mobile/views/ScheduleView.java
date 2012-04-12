package com.valadd.mobile.views;

public class ScheduleView {
	
	private String courseRef;
	private String courseTitle;
	private String courseID;
	private String presenters;
	private String pageHREF;
	private String dateAndTime;
	private String location;
	private String dow;
	private String begTime;
	private String conference;
	
	
	public ScheduleView(String courseRef, String courseTitle, String courseID,
			String presenters, String pageHREF, String dateAndTime,
			String location, String conference) {
		super();
		this.courseRef = courseRef;
		this.courseTitle = courseTitle;
		this.courseID = courseID;
		this.presenters = presenters;
		this.pageHREF = pageHREF;
		this.dateAndTime = dateAndTime;
		this.location = location;
		String[] daySplit = dateAndTime.split(",");
		this.dow = daySplit[0]; // always the first element
		String timeSplit = daySplit[2].substring(daySplit[2].indexOf(":"));
		this.begTime = getMilitaryTime(timeSplit.substring(1,timeSplit.indexOf("-")).trim());
		this.conference = conference;
	}
	
	public String getCourseRef() {
		return courseRef;
	}
	public void setCourseRef(String courseRef) {
		this.courseRef = courseRef;
	}
	public String getCourseTitle() {
		return courseTitle;
	}
	public void setCourseTitle(String courseTitle) {
		this.courseTitle = courseTitle;
	}
	public String getCourseID() {
		return courseID;
	}

	public String getDow() {
		return dow;
	}

	public String getBegTime() {
		return begTime;
	}

	public void setCourseID(String courseID) {
		this.courseID = courseID;
	}
	public String getPresenters() {
		return presenters;
	}
	public void setPresenters(String presenters) {
		this.presenters = presenters;
	}
	public String getPageHREF() {
		return pageHREF;
	}
	public void setPageHREF(String pageHREF) {
		this.pageHREF = pageHREF;
	}
	public String getDateAndTime() {
		return dateAndTime;
	}
	public void setDateAndTime(String dateAndTime) {
		this.dateAndTime = dateAndTime;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}

	public String getConference() {
		return conference;
	}

	private String getMilitaryTime(String timeIN){
		
		String timeOut = "";
		String hours = "";
		String AMPM = "";
		
		String[] hour = timeIN.split(":");
		String[] mins = hour[1].split(" ");
		String[] AP = timeIN.split(" ");
		
		hours = hour[0];
		AMPM = AP[1];
		
		if(AMPM.equals("PM"))
			if(!hours.equals("12")){
				int iHour = Integer.parseInt(hours);
				hours = String.valueOf(iHour + 12);
			}
		timeOut = hours+mins[0];
		
		return timeOut;
	}
}
