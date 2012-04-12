/**
 * Copyright 2011 
 * Value Added Software, Inc.  www.valadd.com
 * If no licensing document is found with the source code
 * Or not specific licensing directives are in the source code
 * Please contact Pete Helgren - pete@valadd.com for 
 * permission to use this code.
 */
package com.valadd.mobile.views;

/**
 * @author pete
 *
 */
public class AbstractView {

	String courseID;         
	String absText;
	String conference;
	
	public AbstractView(String courseID, String absText, String conference) {
		super();
		if(conference==null)
			conference = "";
		this.courseID = courseID;
		this.absText = absText;
		this.conference = conference;
	}

	public String getCourseID() {
		return courseID;
	}

	public void setCourseID(String courseID) {
		this.courseID = courseID;
	}

	public String getAbsText() {
		return absText;
	}

	public void setAbsText(String absText) {
		this.absText = absText;
	}

	public String getConference() {
		return conference;
	}

	public void setConference(String conference) {
		this.conference = conference;
	}
	
	
}
