---
title: "Top 5 Metrics Every RevOps Leader Should Track"
date: 2026-02-06
url: https://revopsinflection.substack.com/p/top-5-metrics-every-revops-leader
---

Data.

RevOps teams LOVE data.

Thanks for reading RevOps Unfiltered! Subscribe for free to receive new posts and support my work.

But how do you focus on the key metrics that really tell the story of what’s happening in your org? Today, I want to focus on what I believe to be the top 5 metrics to measure. It was much harder than I thought it would be to narrow it down considering you’re covering marketing, sales and customer success.

## **Metric 1: Pipeline Coverage**

There was a [great thread on pipe coverage](https://www.linkedin.com/posts/hayesdavis_youre-probably-doing-pipeline-coverage-wrong-activity-7282761111634956288-n4lf) on LinkedIn in early 2025 and lots of great link outs to [Paul Stansik](https://www.linkedin.com/in/paulstansik/) and the [Kellblog](https://kellblog.com/) around this topic. [Hayes](https://www.linkedin.com/in/hayesdavis/) did a great overview – check it out [here](https://unchartedterritory.gradient.works/p/the-power-of-pipeline-coverage).

**Definition**: The ratio of pipeline value against the remaining go get (target – won)

**Why does it matter**? Helps to get an early read on whether or not we should have confidence in our ability to attain our plan.

**Calculation**:

_Formula_: Total Pipeline ÷ Go Get (Target – Won) – typically measured in quarters for longer sales cycles. Monthly/transactional businesses likely aren’t using this as much but would be on a monthly timeframe)

**How to Track**: If possible, using a warehouse makes this very easy. If not, using tools like Salesforce’s Reporting Snapshots will help. You can even brute force it by manually exporting your pipeline data and building your own database of CSVs.

_Note_: You’ll see in the link below that the team recommends manually keying in the numbers so they have the numbers drilled in. IMHO if you’re looking at the data weekly and have the ability to quickly see prior periods, you’ll quickly understand the numbers.

Paul has a fantastic template: [https://www.parkergale.com/salesmetricsplaybookdownload](https://www.parkergale.com/salesmetricsplaybookdownload)

## **Metric 2: Conversion Rates**

**Definition**: The percentage of deals that progress to the next step in the funnel. This should be by Lifecycle Stage (MQL>SAL>SQL>Sales Process>Won) or through the SiriusDecisions Demand Unit Waterfall or even the new Bowtie from Winning by Design.

**Why it matters**: To show how effective your processes are in converting through the funnel. For sellers, as an example, you can see where deals stall out or fall out of your pipeline by looking at stage to stage conversion data. With that insight, you can prioritize sales enablement to support increasing the conversion rate or shortening the time it takes to move through the stage (ex: more focused, timebound POCs for enterprise deals vs sprawling, never ending evaluations of enterprise buyers).

**Calculation:**

_Formula_: Stage 2 ÷ Stage 1, Stage 3 ÷ Stage 2, etc.

_Notes_:

(1) Understand what the driver of a lower late stage conversion rate may be. If your team is seeing deals drop out at Negotiation or Contracting, it may not require Chris Voss coming in to help your team negotiate better. Based on my experience something earlier in the funnel was missed (poor discovery, misalignment to value, etc.).

(2) I prefer to use units here rather than $ as whales can skew your numbers.

(3) You can collapse the entire Sales Process portion into the much maligned “Win Rate” calculation which would be = Won Deals ÷ Total deals closed in period.

**How to track**: If you’re in SFDC, I recommend a Custom Object (similar to the work [CS2](https://www.linkedin.com/company/cs2-marketing/about/) is doing). It can combine all of the different tables in CRM into a single place to run your analytics. If you have a rockstar data team that can dynamically piece it together into a table in your warehouse you can do that as well. If not, you’re looking at a lot Excel Olympics to get accurate reporting and you’re limited in your ability to cut the data by Product, Region, Rep, Lead Source, etc.

## **Metric 3: Pipeline Velocity**

**Definition**: The measure of how quickly deals move through the pipeline to booking.

**Why it matters**: Pipeline Velocity gives a real-time view of sales efficiency and the trend helps you understand what parts of your sales motion need attention.

**Calculation**:

_Formula_: (# of Opps x Win Rate x Avg Deal Size) ÷ Sales cycle length

How to track: Having data snapshots is key here to see the trend over time. Use the same sources as described in Metric 1.

_Note_: If Pipe Velocity is decreasing over time, look at each of the components to determine the why. Are your win rates decreasing? Is your sales price declining / going down-market?

## **Metric 4: Net Retention Rate (NRR)**

**Definition**: The value of your customer base at the end of the period over your opening value in the same period.

**Why it matters**: NRR >100% is key to growing your business. Anything less and your heavy/expensive efforts on New logo are just filling in the hole of customers churning. I prefer NRR over GRR because GRR has an impact on NRR. If you are able to hit your expansion ARR targets but are missing NRR %, you know your churn is impacting you negatively. If your GRR is higher than planned, you need less expansion ARR to reach the NRR plan.

**Calculation**:

_Formula_: (ARR at start of period + Expansion ARR – Churn ARR – Downsell ARR) ÷ ARR at start of period

**How to track**: Finance will typically own the calculation through their systems. I’ve done this through SFDC before but it involved quite a bit of automation to handle multi-year deals.

## **Metric 5: Pipeline Creation**

**Definition**: The total number and value of opportunities created in a period.

**Why it matters**: Pipeline is the leading indicator of future bookings. Not only do you need to convert existing pipeline (Metric 2), you need to continually be filling the top of the funnel.

**Calculation**:

_Formula_: Sum of ARR of all created opportunities in a period OR Count of all created opportunities in a period

**How to track**: Simple CRM reports should be able to generate these numbers over time. Be sure to have your system set up to be able to analyze the creation by source (sales v marketing v partner v SDR) and sales team (geo, segmentation, etc)

_Notes_: Expect seasonality in pipe creation. Month 3 of a quarter is typically focusing on closing deals and you’ll see some decrease in creation. Different industries may see different timings (ex: education businesses tying closer to school years). Be sure to have a target number of opps to be created by rep and monitor it closely. This should tie in to your Sales Capacity Model. Yes, this risks gaming the system but we will know quickly if our Pipeline Velocity is decreasing because our opp volume is increasing without the corresponding increase in bookings.

## **Wrapping it up.**

There you have it. My top 5 metrics. There is so much more underneath each one of these (and some that are left out) but I thought these belong in the KPI hall of fame.

What are your favorite metrics? Let us know!

Thanks for reading RevOps Unfiltered! Subscribe for free to receive new posts and support my work.
