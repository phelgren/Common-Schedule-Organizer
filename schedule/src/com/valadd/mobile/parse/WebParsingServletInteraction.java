/**
 * Copyright 2011 
 * Value Added Software, Inc.  www.valadd.com
 * If no licensing document is found with the source code
 * Or not specific licensing directives are in the source code
 * Please contact Pete Helgren - pete@valadd.com for 
 * permission to use this code.
 */
package com.valadd.mobile.parse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.niggle.servlet.NiggleConfig;
import org.niggle.servlet.ServletInteraction;

import com.valadd.mobile.helpers.ScheduleHelper;
import com.valadd.mobile.views.AbstractView;
import com.valadd.mobile.views.ScheduleView;

import flexjson.JSONSerializer;

/**
 * @author pete
 *
 */
public class WebParsingServletInteraction extends ServletInteraction {

	// Temporary hack to set the root page for schedule
	// private static final String WEBROOT = "http://common.confex.com/common/s11/webprogram/";
	
	public WebParsingServletInteraction(HttpServletRequest request,
			HttpServletResponse response, NiggleConfig config)
			throws IOException {
		
		super(request, response, config);

		
		// TODO Auto-generated constructor stub
	}
	
	// All this guy does is return a JSON string of the schedule
	
	public void execDefault() throws IOException{
		
        String date = request.getParameter("scheduleDate");
        String conference = request.getParameter("conference");
        
        if(date==null || date.length()==0)
        	date = "all";
        
        //loadDB(); // One time to load and then schedule for every 30 minutes
        
        if((date==null || date.equals("all"))  && conference==null)
        	execHTML5();
        else{
		StringBuffer schedule = returnSchedules(date, conference);
		
      	PrintWriter out = response.getWriter();
      	out.print(schedule.toString());
      	out.flush();
		
      	hasRedirected = true;
        }
	}
	
	public void execHTML5() throws IOException{
		

		page = getPage("schedules.htm");
	}
	
	public void execUpdateDB() throws IOException {
		
		String conference = request.getParameter("conference");
		
		loadDB(conference);
		
      	PrintWriter out = response.getWriter();
      	out.print("Done");
      	out.flush();
      	hasRedirected = true;
		
	}
	public void loadDB(String conference) throws IOException{

		String WEBROOT = "";
		// How far back do we want to retain schedules?  Maybe a full year maybe more...
		if(conference.equals("S2011"))
				WEBROOT="http://common.confex.com/common/s11/webprogram/";
		if(conference.equals("F2011"))
				WEBROOT= "http://common.confex.com/common/f11/webprogram/";
		if(conference.equals("S2012"))
			WEBROOT= "http://common.confex.com/common/s12/webprogram/";		
		if(conference.equals("S2011")){
		// might pass the date in for selecting a specific date
		parsePageToDB(WEBROOT,WEBROOT + "meeting2011-04-30.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2011-05-01.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2011-05-02.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2011-05-03.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2011-05-04.html",conference);
		}
		
		if(conference.equals("F2011")){
			// might pass the date in for selecting a specific date
			parsePageToDB(WEBROOT,WEBROOT + "meeting2011-10-02.html",conference);
			parsePageToDB(WEBROOT,WEBROOT + "meeting2011-10-03.html",conference);
			parsePageToDB(WEBROOT,WEBROOT + "meeting2011-10-04.html",conference);
			parsePageToDB(WEBROOT,WEBROOT + "meeting2011-10-05.html",conference);
			}
		
		if(conference.equals("S2012")){
		// might pass the date in for selecting a specific date
		parsePageToDB(WEBROOT,WEBROOT + "meeting2012-05-05.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2012-05-06.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2012-05-07.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2012-05-08.html",conference);
		parsePageToDB(WEBROOT,WEBROOT + "meeting2012-05-09.html",conference);
		}		
		
	}
	
	public StringBuffer returnSchedules(String date, String conference){
		
		StringBuffer sb = new StringBuffer();
		String c = "";
		ScheduleHelper sh = new ScheduleHelper();
		
		List schedules = sh.getSchedules(date, conference);
		
		Iterator i = schedules.iterator();
		sb.append("[");
		while(i.hasNext()){
		  
			ScheduleView sv = (ScheduleView) i.next();
		    sb.append(c);
		    sb.append(new JSONSerializer().exclude("class").serialize(sv));
		  
		    c = ",";

		}
	
	sb.append("]");
	
	//System.out.println(sb.toString());
	return sb;
	}
	
	public void parsePageToDB(String webroot,String urlString, String conference)throws IOException{
		
		Document doc = Jsoup.connect(urlString).get();
		ScheduleHelper sh = new ScheduleHelper();
		
		if(doc!=null) {
		Elements items = doc.getElementsByClass("info");
		int idx = 0;
		int os = 0;
		for (Element item : items) {
			  idx=0;
			  String html = item.html();
			  String linkHref = item.attr("href");
			  String linkText = item.text();
			  
			  // Hand tool some JSON from the parsed string
			  // We are going to make some assumptions about 
			  // where the data is
			  
			  // The course reference number is in the first few positions of the linkText
			  
			  idx = linkText.indexOf(' ');
			  String courseRef = linkText.substring(0, idx);
			  // The course text is between the courseref and the course ID
			  os = idx+1;
			  idx = linkText.lastIndexOf(')') - 7;
			  String courseTitle = linkText.substring(os,idx).trim();
			  os=idx + 1;
			  idx = linkText.lastIndexOf(')');
			  
			  String courseID = linkText.substring(os,idx);
			  
			  String presenters = linkText.substring(idx+1).trim();
			  
			  os = html.indexOf("href=")+ 6;
			  idx = html.indexOf("html");
			  
			  String pageHREF = html.substring(os,idx+4);
			  
			  String datesAndTimes[] = getTimeAndLoc(webroot,pageHREF,courseID);
//				String[] daySplit = datesAndTimes[0].split(",");
//				String dow = daySplit[0]; // always the first element
//			  if(dow.equals("Monday")){
//			  System.out.println("CourseRef = " + courseRef);
///			  System.out.println("CourseTitle = " + courseTitle);
//			  System.out.println("CourseID = " + courseID);
//			  System.out.println("Presenters = " + presenters);
//			  System.out.println("RageRef = " + pageHREF);
//			  System.out.println("Date and Time = " + datesAndTimes[0]);
//			  System.out.println("Location = " + datesAndTimes[1]);
//			  
//			  }		  
			  ScheduleView sv = new ScheduleView(courseRef, courseTitle, courseID, presenters, pageHREF, datesAndTimes[0], datesAndTimes[1], conference);
			  
			  sh.addOrUpdateSchedule(sv, false);
		}
		}

	}
	
	protected String[] getTimeAndLoc(String WEBROOT,String page, String sessionID) throws IOException{
		
		String[] timeAndLoc = new String[2];
		Document doc = Jsoup.connect(WEBROOT + page).timeout(15*1000).get();
		String dateTime = "";
		String location = "";
		String absText = "";
		
		ScheduleHelper sh = new ScheduleHelper();
		
		Elements times = doc.getElementsByClass("datetime");
		// There wiil only be one but in any case we grab the last
		for (Element datetime:times){
			dateTime = datetime.text();
		}
		
		Elements locs = doc.getElementsByClass("location");
		// There wiil only be one but in any case we grab the last
		for (Element loc:locs){
			location = loc.text();
		}
		
		timeAndLoc[0]=dateTime;
		timeAndLoc[1]=location;
		
		Elements sessabs = doc.getElementsByClass("sessabs");
		for (Element sess:sessabs){
			// First one is the Abstract
			if(absText.length()==0)
				absText = sess.text().replaceAll("‘", "\\\\\'").replaceAll("’","\\\\\'")
				.replaceAll("“","\\\\\"").replaceAll("”","\\\\\"").replaceAll("– ", "-");
		}
			sh.addOrUpdateAbstract(absText, sessionID, false);
		
		return timeAndLoc;
	}
	
	public void execGetAbstract() throws IOException{
		
        String sess = request.getParameter("sessID");
        String absText = "";
        String rText = "";
        if(sess==null || sess.length()==0)
        	sess = "none";
        
        StringBuffer sb = new StringBuffer();
        ScheduleHelper sh = new ScheduleHelper();
        absText = sh.getAbstract(sess);
		
        rText = absText.replaceAll("\"", "\\\\\"");
        
        
        sb.append("{");
        sb.append("\"absText\":\"").append(rText).append("\"");
        sb.append("}");
        
      	PrintWriter out = response.getWriter();
      	out.print(sb.toString());
      	out.flush();
		
      	hasRedirected = true;
	}
	
	public void execGetAbstracts() throws IOException{
		
		StringBuffer sb = new StringBuffer();
		String c = "";
		ScheduleHelper sh = new ScheduleHelper();
		
		List abstracts = sh.getAbstracts();
		
		Iterator i = abstracts.iterator();
		sb.append("[");
		while(i.hasNext()){
		  
			AbstractView av = (AbstractView) i.next();
		    sb.append(c);
		    sb.append(new JSONSerializer().exclude("class").serialize(av));
		  
		    c = ",";

		}
	
	sb.append("]");
	
  	PrintWriter out = response.getWriter();
  	out.print(sb.toString());
  	out.flush();
	
  	hasRedirected = true;

	}
	
	public void execGetProxiedJSON() throws IOException{
		//http://common.confex.com/common/s12/sync.cgi/Session_Listing.json
		
		String url = request.getParameter("url");
		
		DefaultHttpClient httpclient = new DefaultHttpClient();
        httpclient = new DefaultHttpClient();
        httpclient.getParams().setParameter("http.socket.timeout", new Integer(15000)); //15 seconds
        httpclient.getParams().setParameter("http.connection.timeout", new Integer(15000)); //15 seconds
        HttpGet httpget = new HttpGet(url);

        HttpResponse res;
        HttpEntity entity;
       	PrintWriter out = response.getWriter();
       	StringBuilder jsonText = new StringBuilder();
       	
       	response.setContentType("application/json");
		try {
			res = httpclient.execute(httpget);
			
	        entity = res.getEntity();
	        
			InputStreamReader isr = new InputStreamReader( entity.getContent() );
			BufferedReader in = new BufferedReader( isr,1024);
 
			String line;

			// This is SPECIFIC to building a punch grid
			// This is a "throw away" call just to build any missing records in the db
			
			while ( (line = in.readLine() ) != null  && line.indexOf("404 Not Found")==-1)
			{
				jsonText.append(line);
			}
	        
	       	//out.print(jsonText);
	       	
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
		out.print(jsonText.toString());
      	out.flush();
      	httpclient.getConnectionManager().shutdown();
      	hasRedirected = true;
	}
}

