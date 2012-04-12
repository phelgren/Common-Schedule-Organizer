package com.valadd.mobile.helpers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.edtechlabs.db.DatabaseManager;

import com.valadd.mobile.views.AbstractView;
import com.valadd.mobile.views.ScheduleView;

public class ScheduleHelper {

	public List getSchedules(String date, String conference) {
		
		List schedules = new ArrayList();
		String sql = "";
		boolean select = false;
		
		if(date.equals("all"))
			sql = "select courseRef,courseTitle,courseID,presenters,pageHREF,dateandTime" +
					",location,cast(stime as int) as itime,conference from schedules where conference = ?" +
				    "order by dow,itime ";

		else{
			// should already be sanitized
			sql = "select courseRef,courseTitle,courseID,presenters,pageHREF,dateandTime," +
			",location,cast(stime as int) as itime, conference from schedules where conference = ? and dow = ? " +
		    "order by dow,itime ";
			select = true;
		}
		Connection conn = null;
		ResultSet rs = null;
		PreparedStatement stmt = null;

		conn = DatabaseManager.getInstance().getConnection();
		
		try
		{

	
			stmt = conn.prepareStatement(sql);
			stmt.setString(1, conference);
			if(select)
				stmt.setString(2, "%"+date+"%");
			
			rs= stmt.executeQuery();
			
			ScheduleView sv = null;
			
			
			while(rs.next()){
				
				sv = new ScheduleView(rs.getString("courseRef"),
									  rs.getString("courseTitle"),
									  rs.getString("courseID"),
									  rs.getString("presenters"),
									  rs.getString("pageHREF"),
									  rs.getString("dateAndTime"),
									  rs.getString("location"),
									  rs.getString("conference"));
				

					schedules.add(sv);

			
			}

		
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}
		finally
		{
			try
			{
				if (rs != null)
				{
					rs.close();
				}
				if (stmt != null)
				{
					stmt.close();
				}
				if (conn != null)
				{
					conn.close();
				}
			}
			catch (SQLException sqle)
			{
				//  handle exception
			}
		}
		return schedules;
		
	}

	public boolean addOrUpdateSchedule(ScheduleView sv, boolean delete){
		boolean completionStatus = false;
		
		String sqlExists = "select * from schedules where courseId = ? and conference = ?";
		String sqlInsert = "insert into schedules (courseRef,courseTitle,courseID,presenters,pageHREF,dateAndTime,location,dow,stime,conference) " +
							"values (?,?,?,?,?,?,?,?,?,?)";
		String sqlUpdate = "update schedules set courseRef = ?,courseTitle=?,presenters=?,pageHREF=?,dateAndTime=?,location=?,dow=?,stime=?" +
							"where courseID = ? and conference = ?";
		String sqlDelete = "delete from schedules where courseID = ? and conference = ?)";
		
		Connection conn = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		Statement stmt = null;

		conn = DatabaseManager.getInstance().getConnection();
		
		try
		{
			ps = conn.prepareStatement(sqlExists);
			
			ps.setString(1, sv.getCourseID());
			ps.setString(2, sv.getConference());
			
			rs = ps.executeQuery();

		
			if(!rs.next()){ // record not there
				//OK to insert
				// clean up
				
				rs.close();		
				ps.close();
				

				ps = conn.prepareStatement(sqlInsert);
				
				ps.setString(1, sv.getCourseRef());
				ps.setString(2, sv.getCourseTitle());
				ps.setString(3, sv.getCourseID());
				ps.setString(4, sv.getPresenters());
				ps.setString(5, sv.getPageHREF());
				ps.setString(6, sv.getDateAndTime());
				ps.setString(7, sv.getLocation());
				ps.setString(8, sv.getDow().trim());
				ps.setString(9, sv.getBegTime());
				ps.setString(10, sv.getConference());
				
				ps.execute();
				
				completionStatus = true;
			}
			else // The record exists
			{
				if(delete){
					// clean up
					if(rs!=null )
						rs.close();

					if(ps!=null )
						ps.close();
					
					ps = conn.prepareStatement(sqlDelete);
					
					ps.setString(1, sv.getCourseID());
					ps.setString(2, sv.getConference());

					rs = ps.executeQuery();
					completionStatus = true;
				}
				else {
					if(!delete){
						// clean up
						if(rs!=null)
							rs.close();

						if(ps!=null)
							ps.close();
						
						ps = conn.prepareStatement(sqlUpdate);
						
						ps.setString(1, sv.getCourseRef());
						ps.setString(2, sv.getCourseTitle());
						ps.setString(3, sv.getPresenters());
						ps.setString(4, sv.getPageHREF());
						ps.setString(5, sv.getDateAndTime());
						ps.setString(6, sv.getLocation());
						ps.setString(7, sv.getDow().trim());
						ps.setString(8, sv.getBegTime());
						ps.setString(9, sv.getCourseID());
						ps.setString(10, sv.getConference());
						ps.execute();
						
						completionStatus = true;
					}
				}
					
			}
			
		}
		catch (SQLException sqle){
			sqle.printStackTrace(); // waste of time but leave it for now
		}
		finally
		{  // Clean up all the connection stuff
			try
			{
				if (rs != null)
				{
					rs.close();
				}
				if (ps != null)
				{
					ps.close();
				}
				if (conn != null)
				{
					conn.close();
				}
			}
			catch (SQLException sqle)
			{
				//  handle exception
				sqle.printStackTrace();
			}
			
		}
		return completionStatus;
		
	}
	
	public boolean addOrUpdateAbstract(String absText, String sessionID, boolean delete){
		boolean completionStatus = false;
		
		String sqlExists = "select * from abstracts where courseId = ?";
		String sqlInsert = "insert into abstracts (courseID,absText) " +
							"values (?,?)";
		String sqlUpdate = "update abstracts set absText = ? where courseID = ? ";

		String sqlDelete = "delete from abstracts where courseID = ?)";
		
		Connection conn = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		Statement stmt = null;

		conn = DatabaseManager.getInstance().getConnection();
		
		try
		{
			ps = conn.prepareStatement(sqlExists);
			
			ps.setString(1, sessionID);

			rs = ps.executeQuery();

		
			if(!rs.next()){ // record not there
				//OK to insert
				// clean up
				
				rs.close();		
				ps.close();
				

				ps = conn.prepareStatement(sqlInsert);
				
				ps.setString(1, sessionID);
				ps.setString(2, absText);
				
				ps.execute();
				
				completionStatus = true;
			}
			else // The record exists
			{
				if(delete){
					// clean up
					rs.close();
					ps.close();
					
					ps = conn.prepareStatement(sqlDelete);
					
					ps.setString(1, sessionID);

					rs = ps.executeQuery();
					completionStatus = true;
				}
				else{

					rs.close();
					ps.close();
					
					ps = conn.prepareStatement(sqlUpdate);
					
					ps.setString(1, absText);
					ps.setString(2, sessionID);

					ps.execute();
					
					completionStatus = true;
				}
					
				
					
			}
			
		}
		catch (SQLException sqle){
			sqle.printStackTrace(); // waste of time but leave it for now
		}
		finally
		{  // Clean up all the connection stuff
			try
			{
				if (rs != null)
				{
					rs.close();
				}
				if (ps != null)
				{
					ps.close();
				}
				if (conn != null)
				{
					conn.close();
				}
			}
			catch (SQLException sqle)
			{
				//  handle exception
				sqle.printStackTrace();
			}
			
		}
		return completionStatus;
		
	}
	
	public String getAbstract(String sessionID) {
		
		String absText = "";
		String sql = "select absText from abstracts where courseID = ?";

		Connection conn = null;
		ResultSet rs = null;
		PreparedStatement stmt = null;

		conn = DatabaseManager.getInstance().getConnection();
		
		try
		{
			stmt = conn.prepareStatement(sql);
			stmt.setString(1, sessionID);
			
			rs= stmt.executeQuery();
			
			ScheduleView sv = null;
			
			
			while(rs.next()){
				absText = rs.getString("absText");
			
			}

		
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}
		finally
		{
			try
			{
				if (rs != null)
				{
					rs.close();
				}
				if (stmt != null)
				{
					stmt.close();
				}
				if (conn != null)
				{
					conn.close();
				}
			}
			catch (SQLException sqle)
			{
				//  handle exception
			}
		}
		return absText;
		
	}
	
	public List getAbstracts() {
		
		String absText = "";
		String sql = "select courseID, absText, conference from abstracts";

		Connection conn = null;
		ResultSet rs = null;
		PreparedStatement stmt = null;
		List abstracts = new ArrayList();

		conn = DatabaseManager.getInstance().getConnection();
		
		try
		{
			stmt = conn.prepareStatement(sql);
			
			rs= stmt.executeQuery();
	
			while(rs.next()){
				
				abstracts.add(new AbstractView(rs.getString("courseID"),rs.getString("absText"),rs.getString("conference")));
			
			}

		
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}
		finally
		{
			try
			{
				if (rs != null)
				{
					rs.close();
				}
				if (stmt != null)
				{
					stmt.close();
				}
				if (conn != null)
				{
					conn.close();
				}
			}
			catch (SQLException sqle)
			{
				//  handle exception
			}
		}
		return abstracts;
		
	}
}
